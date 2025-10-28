/**
 * Example demonstrating FULL TypeScript type safety with gqlb
 * 
 * This shows how the generated FieldFn types enable complete autocomplete
 * and type checking for the Atlassian GraphQL API.
 */

import { createQueryBuilder, $$ } from '../src/index.js';
import { print } from 'graphql';

// Create the fully-typed query builder
const builder = createQueryBuilder();

// Define typed variables
const cloudId = $$<string>('cloudId');
const issueKey = $$<string>('issueKey');

// Build a query with FULL autocomplete!
// TypeScript knows EVERY field available in the Atlassian schema
const query = builder.query('GetJiraIssue', q => [
  // q. <-- TypeScript suggests: jira, atlasGo, actions, user, etc.
  q.jira({ cloudId }, jira => [
    // jira. <-- TypeScript suggests: issueByKey, project, board, etc.
    jira.issueByKey({ issueKey }, issue => [
      // issue. <-- TypeScript suggests: key, id, summaryField, statusField, etc.
      issue.key(),
      issue.summaryField(summary => [
        // summary. <-- TypeScript knows this is JiraSingleLineTextField
        summary.text()
      ]),
      issue.descriptionField(desc => [
        // desc. <-- TypeScript knows this is JiraRichTextField
        desc.richText(richText => [
          richText.plainText()
        ])
      ]),
      issue.statusField(statusField => [
        // statusField. <-- TypeScript knows this is JiraStatusField
        statusField.name(),
        statusField.status(status => [
          // status. <-- TypeScript knows this is JiraStatus
          status.name()
        ])
      ]),
      issue.assigneeField(assignee => [
        // assignee. <-- TypeScript knows this is JiraAssigneeField
        assignee.user(user => [
          // user. <-- TypeScript knows this implements User interface
          user.name(),
          user.accountId()
        ])
      ]),
      issue.createdField(created => [
        // created. <-- TypeScript knows this is JiraDateTimeField
        created.dateTime()
      ])
    ])
  ])
]);

// The result type is FULLY INFERRED!
// TypeScript knows the exact shape without any manual typing:
// {
//   jira: {
//     issueByKey: {
//       key: string;
//       summaryField: {
//         text: string;
//       };
//       descriptionField: {
//         richText: {
//           plainText: string | null;
//         };
//       } | null;
//       statusField: {
//         name: string;
//         statusCategory: {
//           name: string;
//         };
//       };
//       assigneeField: {
//         user: {
//           name: string | null;
//           accountId: string;
//         };
//       } | null;
//       createdField: {
//         dateTime: string;
//       };
//     } | null;
//   };
// }

console.log('✅ Typed query built successfully!\n');
console.log('Generated GraphQL:');
console.log('─'.repeat(80));
console.log(print(query));
console.log('─'.repeat(80));

// Example 2: Query with different fields
const shortQuery = builder.query('GetIssueKey', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key()
    ])
  ])
]);

console.log('\n✅ Short query built successfully!\n');
console.log('Generated GraphQL:');
console.log('─'.repeat(80));
console.log(print(shortQuery));
console.log('─'.repeat(80));

// Example 3: Multiple fields from same issue
const multiFieldQuery = builder.query('GetIssueDetails', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key(),
      issue.summaryField(s => [s.text()]),
      issue.descriptionField(d => [
        d.richText(rt => [rt.plainText()])
      ]),
      issue.assigneeField(a => [
        a.user(u => [u.name(), u.accountId()])
      ])
    ])
  ])
]);

console.log('\n✅ Multi-field query built successfully!\n');
console.log('Generated GraphQL:');
console.log('─'.repeat(80));
console.log(print(multiFieldQuery));
console.log('─'.repeat(80));

console.log('\n🎉 All queries demonstrate FULL type safety!');
console.log('   - Every field has autocomplete');
console.log('   - TypeScript catches typos at compile time');
console.log('   - Result types are automatically inferred');
console.log('   - No manual type annotations needed!');

