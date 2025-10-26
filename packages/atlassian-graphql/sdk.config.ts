/**
 * SDK Configuration - Define which operations to include
 * Add/remove operations as needed
 */

const config = {
  Query: {
    jira: {
      // Jira queries to include in SDK
      rankField: {},
      issue: {},
      issueSearch: {},
      project: {},
      projectSearch: {},
    },
    confluence: {
      // Confluence queries to include
      blogPost: {},
      findSpaces: {},
    },
  },
  Mutation: {
    jira: {
      // Jira mutations to include
      issueCreate: {},
      issueUpdate: {},
      commentCreate: {},
    },
  },
};

export default config;
export type SDKConfig = typeof config;


