import type { GraphQLSchema, GraphQLType, GraphQLNamedType, GraphQLObjectType, GraphQLField, GraphQLInterfaceType } from 'graphql';
import { 
  isObjectType, 
  isInterfaceType,
  isScalarType, 
  isEnumType,
  isListType,
  isNonNullType,
  getNamedType,
  parse
} from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { QueryBuilder, SelectionFn, FieldSelection, BuildContext } from './types.js';
import { isVariable } from './variables.js';

/**
 * Create a callable proxy that supports both function calls and property access
 * - builder.query(q => [...]) - anonymous operation
 * - builder.query('Name', q => [...]) - named operation (backward compatible)
 * - builder.query.Name(q => [...]) - named operation (new fluent API)
 */
function createOperationProxy(
  operationType: 'query' | 'mutation' | 'subscription',
  getRootType: () => GraphQLObjectType,
  context: BuildContext
): any {
  // Base function for direct calls
  const baseFunction = (nameOrSelectionFn: any, selectionFn?: any) => {
    if (typeof nameOrSelectionFn === 'function') {
      // Anonymous operation: builder.query(q => [...])
      return buildOperation(operationType, getRootType(), nameOrSelectionFn, context);
    }
    // Named operation (string): builder.query('Name', q => [...])
    return buildOperation(operationType, getRootType(), selectionFn as SelectionFn, context, nameOrSelectionFn as string);
  };

  // Create proxy to intercept property access
  return new Proxy(baseFunction, {
    get(target, prop: string) {
      // Ignore symbols and built-in properties
      if (typeof prop === 'symbol' || prop.startsWith('_')) {
        return undefined;
      }

      // Return a function that will be called with the selection function
      // This enables: builder.query.SearchMyIssues(q => [...])
      return (selectionFn: SelectionFn) => {
        return buildOperation(operationType, getRootType(), selectionFn, context, prop);
      };
    },
    // Make the proxy callable
    apply(target, thisArg, args: [any, any?]) {
      return baseFunction.apply(thisArg, args);
    }
  });
}

/**
 * Create a query builder for a GraphQL schema
 * 
 * @template TQueryFields - Optional type for Query fields (for full type safety)
 * @template TMutationFields - Optional type for Mutation fields (for full type safety)
 * 
 * @example Untyped usage:
 * ```typescript
 * const builder = createQueryBuilder(schema);
 * ```
 * 
 * @example Typed usage:
 * ```typescript
 * import type { QueryFields, MutationFields } from './generated/field-types';
 * const builder = createQueryBuilder<QueryFields, MutationFields>(schema);
 * ```
 */
export function createQueryBuilder<TQueryFields = any, TMutationFields = any>(
  schema: GraphQLSchema
): QueryBuilder {
  const context: BuildContext = {
    schema,
    variables: new Map(),
    fragments: new Map(),
  };

  return {
    query: createOperationProxy('query', () => schema.getQueryType()!, context),
    mutation: createOperationProxy('mutation', () => schema.getMutationType()!, context),
    subscription: createOperationProxy('subscription', () => schema.getSubscriptionType()!, context),
  } as QueryBuilder;
}


/**
 * Normalize selections array: extract FieldSelection from callable objects
 * Supports both:
 * - search.totalCount (returns callable with __fieldSelection marker)
 * - search.totalCount() (returns FieldSelection directly)
 */
function normalizeSelections(selections: any[]): FieldSelection[] {
  return selections.map(sel => {
    // If it's a callable with __fieldSelection marker (property access)
    if (sel && typeof sel === 'function' && sel.__fieldSelection) {
      const fieldSelection = sel.__fieldSelection;
      // Recursively normalize nested selections
      if (fieldSelection.selection) {
        fieldSelection.selection = normalizeSelections(fieldSelection.selection);
      }
      return fieldSelection;
    }
    // If it's already a FieldSelection (function call)
    if (sel && typeof sel === 'object' && 'name' in sel) {
      // Recursively normalize nested selections
      if (sel.selection) {
        sel.selection = normalizeSelections(sel.selection);
      }
      return sel;
    }
    throw new Error(`Invalid selection: ${sel}`);
  });
}

/**
 * Build a GraphQL operation (query/mutation/subscription)
 */
function buildOperation(
  operationType: 'query' | 'mutation' | 'subscription',
  rootType: GraphQLObjectType,
  selectionFn: SelectionFn,
  context: BuildContext,
  operationName?: string
): TypedDocumentNode<any, any> {
  // Reset variables for this operation
  context.variables.clear();

  // Create proxy for the root type
  const proxy = createTypeProxy(rootType, context);

  // Execute selection function to collect fields
  const rawSelections = selectionFn(proxy);

  // Normalize selections: extract FieldSelection from callable objects (property access)
  const selections = normalizeSelections(rawSelections);

  // Build the operation string
  const operationString = buildOperationString(operationType, selections, context, operationName);

  // Parse into a DocumentNode
  const documentNode = parse(operationString);

  // Return as TypedDocumentNode
  return documentNode as TypedDocumentNode<any, any>;
}

/**
 * Create a Proxy for a GraphQL type that intercepts field access
 * Supports both object types and interface types
 */
function createTypeProxy(type: GraphQLObjectType | GraphQLInterfaceType, context: BuildContext): any {
  const fields = type.getFields();

  return new Proxy({} as any, {
    get(target, prop: string) {
      // Ignore symbols and built-in properties
      if (typeof prop === 'symbol' || prop.startsWith('_')) {
        return undefined;
      }

      const field = fields[prop];
      if (!field) {
        throw new Error(`Field "${prop}" does not exist on type "${type.name}"`);
      }

      // Check if field is a scalar (leaf type - no sub-selections needed)
      const fieldType = getNamedType(field.type);
      const isScalar = isScalarType(fieldType) || isEnumType(fieldType);

      // For scalar fields, return a callable object that can be used as both:
      // - Property: search.totalCount
      // - Function: search.totalCount()
      if (isScalar && field.args.length === 0) {
        const selection = createFieldSelection(prop, field, [], context);
        // Create a callable object
        const callable = (() => selection) as any;
        callable.__fieldSelection = selection; // Marker for property access
        return callable;
      }

      // For non-scalar fields or fields with args, return a function
      return (...args: any[]): FieldSelection => {
        return createFieldSelection(prop, field, args, context);
      };
    },
  });
}

/**
 * Create a field selection from arguments
 */
function createFieldSelection(
  fieldName: string,
  field: GraphQLField<any, any>,
  args: any[],
  context: BuildContext
): FieldSelection {
  let fieldArgs: Record<string, any> | undefined;
  let selectionFn: SelectionFn | undefined;

  // Parse arguments: can be (selectionFn) or (args, selectionFn) or ()
  if (args.length === 0) {
    // Scalar field with no args
  } else if (args.length === 1) {
    if (typeof args[0] === 'function') {
      selectionFn = args[0];
    } else {
      fieldArgs = args[0];
    }
  } else if (args.length === 2) {
    fieldArgs = args[0];
    selectionFn = args[1];
  }

  // Process field arguments and collect variables
  if (fieldArgs) {
    fieldArgs = processArguments(fieldArgs, field, context);
  }

  // If there's a selection function, recursively build nested selections
  let nestedSelections: FieldSelection[] | undefined;
  if (selectionFn) {
    const fieldType = getNamedType(field.type);
    // Support both object types and interface types (interfaces also have fields)
    if (isObjectType(fieldType) || isInterfaceType(fieldType)) {
      const nestedProxy = createTypeProxy(fieldType as GraphQLObjectType | GraphQLInterfaceType, context);
      nestedSelections = selectionFn(nestedProxy);
    }
  }

  return {
    name: fieldName,
    args: fieldArgs,
    selection: nestedSelections,
  };
}

/**
 * Process field arguments and extract variables
 */
function processArguments(
  args: Record<string, any>,
  field: GraphQLField<any, any>,
  context: BuildContext
): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [argName, argValue] of Object.entries(args)) {
    if (isVariable(argValue)) {
      // Register variable
      const fieldArg = field.args.find(a => a.name === argName);
      if (fieldArg) {
        const typeName = printType(fieldArg.type);
        context.variables.set(argValue.name, {
          type: typeName,
          required: isNonNullType(fieldArg.type) || argValue.required,
        });
      }
      processed[argName] = `$${argValue.name}`;
    } else if (typeof argValue === 'object' && argValue !== null) {
      // Recursively process nested arguments
      processed[argName] = processNestedArgument(argValue, context);
    } else {
      processed[argName] = argValue;
    }
  }

  return processed;
}

/**
 * Process nested arguments (input objects, arrays)
 */
function processNestedArgument(value: any, context: BuildContext): any {
  if (Array.isArray(value)) {
    return value.map(item => processNestedArgument(item, context));
  }
  
  if (typeof value === 'object' && value !== null) {
    const processed: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (isVariable(val)) {
        context.variables.set(val.name, {
          type: 'String', // We'd need more context to determine the exact type
          required: val.required,
        });
        processed[key] = `$${val.name}`;
      } else {
        processed[key] = processNestedArgument(val, context);
      }
    }
    return processed;
  }
  
  return value;
}

/**
 * Build the final operation string
 */
function buildOperationString(
  operationType: string,
  selections: FieldSelection[],
  context: BuildContext,
  operationName?: string
): string {
  const parts: string[] = [];

  // Build operation header
  const opName = operationName ? ` ${operationName}` : '';
  
  // Add operation with variables
  if (context.variables.size > 0) {
    const varDeclarations = Array.from(context.variables.entries())
      .map(([name, { type, required }]) => {
        // Don't add ! if type already ends with ! (from schema)
        const needsExclamation = required && !type.endsWith('!');
        return `$${name}: ${type}${needsExclamation ? '!' : ''}`;
      })
      .join(', ');
    parts.push(`${operationType}${opName}(${varDeclarations}) {`);
  } else {
    parts.push(`${operationType}${opName} {`);
  }

  // Add selections
  for (const selection of selections) {
    parts.push(buildSelectionString(selection, 1));
  }

  parts.push('}');

  return parts.join('\n');
}

/**
 * Build a selection string (field with optional nested selections)
 */
function buildSelectionString(selection: FieldSelection, indent: number): string {
  const indentation = '  '.repeat(indent);
  const parts: string[] = [];

  // Field name with optional alias
  let fieldStr = selection.alias ? `${selection.alias}: ${selection.name}` : selection.name;

  // Add arguments
  if (selection.args) {
    const argStr = Object.entries(selection.args)
      .map(([name, value]) => `${name}: ${formatArgumentValue(value)}`)
      .join(', ');
    fieldStr += `(${argStr})`;
  }

  // Add nested selections
  if (selection.selection && selection.selection.length > 0) {
    parts.push(`${indentation}${fieldStr} {`);
    for (const nested of selection.selection) {
      parts.push(buildSelectionString(nested, indent + 1));
    }
    parts.push(`${indentation}}`);
  } else {
    parts.push(`${indentation}${fieldStr}`);
  }

  return parts.join('\n');
}

/**
 * Format an argument value for GraphQL
 */
function formatArgumentValue(value: any): string {
  if (typeof value === 'string' && value.startsWith('$')) {
    // Variable reference
    return value;
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatArgumentValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${formatArgumentValue(v)}`)
      .join(', ');
    return `{${entries}}`;
  }
  return String(value);
}

/**
 * Print a GraphQL type as a string
 */
function printType(type: GraphQLType): string {
  if (isNonNullType(type)) {
    return `${printType(type.ofType)}!`;
  }
  if (isListType(type)) {
    return `[${printType(type.ofType)}]`;
  }
  return (type as GraphQLNamedType).name;
}

