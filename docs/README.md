# Documentation Index

> Complete guide to understanding and using our GraphQL codegen innovation

## 🚀 Start Here

### New to this project?
1. **[Innovation Deep Dive](./INNOVATION.md)** - Understand what makes this unique
2. **[Quick Reference](./QUICK_REFERENCE.md)** - One-page overview
3. **[Demo Walkthrough](./DEMO.md)** - See it in action
4. **[Development Guide](./DEVELOPMENT.md)** - Set up your environment

### Want to share this?
- **[Blog Post](./BLOG_POST.md)** - Ready for dev.to, Medium, Hacker News
- **[Social Media](./SOCIAL_MEDIA.md)** - Copy-paste announcements for Twitter, Reddit, LinkedIn
- **[Comparison Guide](./COMPARISON.md)** - Show why it's better than alternatives

## 📖 Documentation Structure

### 🌟 Innovation & Concepts

#### [Innovation Deep Dive](./INNOVATION.md)
**Complete technical explanation of our multi-stage pipeline**

What you'll learn:
- The "GraphQL Trilemma" problem
- Our 5-stage solution
- Each stage explained in detail
- Real-world results
- Key innovations
- Getting started guide

**Read this if:** You want to understand the full architecture and implementation

---

#### [Blog Post](./BLOG_POST.md)
**TL;DR version optimized for sharing**

What you'll learn:
- The problem in 2 minutes
- Our solution in 5 minutes
- Code examples
- Results summary
- Key innovations

**Read this if:** You want a quick overview or plan to share this on social media

---

#### [Comparison Guide](./COMPARISON.md)
**Detailed comparison vs 6 other approaches**

What you'll learn:
- Feature matrix across all solutions
- Performance benchmarks
- When to use each approach
- Migration paths
- Real-world case study

**Read this if:** You're evaluating solutions or need to justify using this approach

---

#### [Quick Reference](./QUICK_REFERENCE.md)
**One-page cheatsheet**

What you'll learn:
- 5 stages summarized
- Usage patterns
- Setup checklist
- Common pitfalls
- Key concepts

**Read this if:** You understand the concept and need a quick reference

---

### 🎥 Getting Started

#### [Demo Walkthrough](./DEMO.md)
**Step-by-step examples with the Atlassian CLI**

What you'll learn:
- Installing and configuring
- Running queries
- Dynamic field selection
- Using as a library
- Real-world examples

**Read this if:** You want to try it out hands-on

---

#### [Development Guide](./DEVELOPMENT.md)
**Setup, building, testing, contributing**

What you'll learn:
- Prerequisites
- Installation steps
- Building packages
- Running tests
- Contributing guidelines
- Project structure

**Read this if:** You want to contribute or build from source

---

### 🔧 Technical Deep Dives

#### [gqlb Architecture](./GQLB-ARCHITECTURE.md)
**How the runtime proxy builder works**

What you'll learn:
- Proxy-based navigation
- Variable handling
- Schema walking
- Query building
- Implementation details

**Read this if:** You want to understand the runtime builder internals

---

#### [Atlassian GraphQL Architecture](./ATLASSIAN-GRAPHQL-ARCHITECTURE.md)
**Multi-stage pipeline details for Atlassian**

What you'll learn:
- Schema filtering process
- Custom codegen plugin
- Generation pipeline
- File structure
- Nx orchestration

**Read this if:** You want to see a real-world implementation

---

### 📣 Sharing & Promotion

#### [Social Media](./SOCIAL_MEDIA.md)
**Ready-to-post announcements**

What you'll find:
- Twitter thread (7 tweets)
- Reddit post
- Hacker News post
- LinkedIn post
- Discord/Slack announcement
- YouTube description

**Use this if:** You want to share this project on social media

---

#### [Presentation Guide](./PRESENTATION.md)
**Complete presentation outline for talks and workshops**

What you'll find:
- 21-slide deck outline with speaker notes
- 5-minute, 15-minute, and 45-minute versions
- Live demo script
- Workshop exercises (2 hours)
- Tips for presenting to different audiences
- Common Q&A

**Use this if:** You want to give a talk or workshop about this innovation

---

## 🎯 Documentation by Goal

### Goal: Understand the innovation
1. [Innovation Deep Dive](./INNOVATION.md) - Full explanation
2. [Blog Post](./BLOG_POST.md) - Quick summary
3. [Comparison Guide](./COMPARISON.md) - vs alternatives

### Goal: Use it in my project
1. [Quick Reference](./QUICK_REFERENCE.md) - Setup checklist
2. [Demo Walkthrough](./DEMO.md) - Examples
3. [Development Guide](./DEVELOPMENT.md) - Build from source

### Goal: Understand implementation
1. [Innovation Deep Dive](./INNOVATION.md) - Overall architecture
2. [gqlb Architecture](./GQLB-ARCHITECTURE.md) - Runtime builder
3. [Atlassian GraphQL Architecture](./ATLASSIAN-GRAPHQL-ARCHITECTURE.md) - Real example

### Goal: Share with others
1. [Blog Post](./BLOG_POST.md) - Best starting point
2. [Social Media](./SOCIAL_MEDIA.md) - Copy-paste announcements
3. [Comparison Guide](./COMPARISON.md) - Show benefits

### Goal: Contribute
1. [Development Guide](./DEVELOPMENT.md) - Setup
2. [gqlb Architecture](./GQLB-ARCHITECTURE.md) - Core library
3. [Innovation Deep Dive](./INNOVATION.md) - Full picture

---

## 📊 Quick Facts

### The Problem
- Existing GraphQL TypeScript tools force you to choose:
  - Dynamic queries OR type safety
  - Small bundles OR autocomplete
  - Fast IDE OR flexibility

### Our Solution
- Multi-stage pipeline:
  1. Schema Pruning (90% reduction)
  2. Base Types (standard codegen)
  3. Args Map (tree-shaking)
  4. Type Transformation (TypeScript magic)
  5. Runtime Proxy (tiny builder)

### Results
- 94% smaller generated code
- 30x faster autocomplete
- 86% smaller bundles
- Better developer experience

### Key Innovations
1. Config-driven schema pruning
2. Args map plugin for tree-shaking
3. Template literal type detection
4. Separation of types vs implementation
5. Runtime proxy builder

---

## 🔗 External Links

- **GitHub:** https://github.com/ThePlenkov/atlassian-graphql-client
- **npm (CLI):** `@atlassian-tools/cli` (coming soon)
- **npm (Library):** `gqlb`, `@atlassian-tools/gql` (coming soon)

---

## 🤝 Contributing

We welcome contributions! See:
- [Development Guide](./DEVELOPMENT.md) - Setup and build
- [GitHub Issues](https://github.com/ThePlenkov/atlassian-graphql-client/issues) - Report bugs or request features

Areas of interest:
- Custom codegen plugins
- Type transformations
- gqlb features (fragments, directives)
- Documentation
- Performance optimizations

---

## 📄 License

MIT - See [LICENSE](../LICENSE) for details

---

**Built with ❤️ by developers who believe GraphQL tooling should be both powerful and pleasant**

