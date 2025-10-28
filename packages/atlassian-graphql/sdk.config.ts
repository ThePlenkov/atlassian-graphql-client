/**
 * SDK Configuration - defines which GraphQL operations to include
 * 
 * This config is used by filter-schema.ts to prune the full Atlassian schema
 * down to only the operations we actually use, reducing bundle size.
 * 
 * Structure:
 * {
 *   Query: {
 *     [moduleName]: {
 *       [operationName]: true
 *     }
 *   },
 *   Mutation: { ... }
 * }
 */

export default {
  Query: {
    // Jira operations
    jira: {
      // Issue operations
      issueByKey: true,
      issueSearchStable: true,
      
      // Add more Jira operations as needed
      // issue: true,
      // project: true,
      // board: true,
    },
    
    // Confluence operations (add when needed)
    // confluence: {
    //   page: true,
    //   space: true,
    // },
  },
  
  // Mutations
  Mutation: {
    // Jira mutations
    jira: {
      // Issue link mutations
      createIssueLinks: true,
      deleteIssueLink: true,
      
      // Add more mutations as needed
      // createIssue: true,
      // updateIssue: true,
    }
  }
};

