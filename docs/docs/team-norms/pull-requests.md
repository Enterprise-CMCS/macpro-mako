---
layout: default
title: Pull Requests
parent: Team Norms
nav_order: 1
---

# Pull Requests

## Introduction

Pull Requests (PRs) are an essential part of our software development process, enabling code review, discussion, and integration. This document outlines our team norms regarding PRs to ensure a smooth, efficient, and collaborative workflow.

Above all else, please remember: your discretion and judgement supersedes this document.  If you're creating or reviewing a Pull Request that needs to break any of these norms for good reason, that's OK.  This document is the rule; exceptions are expected.

## Creating Pull Requests

### Content and Format

- **Title**: The title of your PR should be carefully considered. It should be descriptive enough to convey the essence of the changes but concise enough to be easily readable. Think of the title as a brief summary that helps others quickly understand the purpose of the PR.
- **Follow the Template**: We use a Pull Request template to standardize and streamline our PR descriptions. It is expected that all PRs will adhere to this template.

### Small, Focused Changes

- **Scope**: Keep PRs focused on a single task or issue to simplify review and discussion.  While most pull requests will each address a single ticket, it's OK to handle multiple Jira tickets in one PR when it makes sense.
- **Size**: Aim for small, manageable PRs. Large PRs should be broken down into smaller parts if possible.
- **Formatters**: Be conscious of formatting updates that your IDE may make automatically, or that you may make along the way.  Sometimes small, non-functional code changes can clutter a pull request.

## Reviewing Pull Requests

### Timeliness

- **Prompt Reviews**: Team members are expected to review PRs in a timely manner, typically next day or sooner.

### Constructive Feedback

- **Respectful Communication**: Provide constructive, respectful feedback.
- **Specific Comments**: Use specific comments to point out issues, suggest improvements, or ask clarifying questions.

### Testing

- **Test as Appropriate**: The burden of full end to end testing lies with the author, our automated testing frameworks, and any manual QA process. However, reviewers should test the environment when they think it necessary, perhaps when they've thought of an edge case that might not be covered.
- **Explain your testing**: The PR approach should typically include some detail around how manual tests were performed.  This helps greatly in allowing reviewers to sign off without needing to test individually.

## Merging Pull Requests

### Passing Checks

- **CI/CD**: Ensure all continuous integration and deployment checks have passed.
- **Code Quality**: Code should meet our standards for quality and maintainability.

### Approval

- **Minimum Approvals**: PRs require a minimum number of approvals (1) from the team members before merging.
- **Outstanding Comments**: If there are comments that ask for action or consideration to be made by the author, please address them prior to merge, regardless if you have approval.

### Merging
- **Author Merges**: After receiving necessary approvals, the PR author is responsible for merging the code.
- **Squashing Protocol**: When merging into the master branch, always squash and merge.  When merging into val and production, create a merge commit.
- **Commit Messages**: We use semantic release to automatically release our product.  Semantic Release looks for commit messages with special [commit message syntax](https://semantic-release.gitbook.io/semantic-release/#commit-message-format).  Please follow this syntax when crafting your commit message.  Note: GitHub will use your PR title as the default commit message when squashing; so, it's recommended to set your PR title equal to the semantic release commit message appropriate for your changeset.

## Responsibility and Accountability

- **Ownership**: The author is responsible for addressing feedback and ensuring the PR is ready for merging.
- **Collaboration**: All team members share the responsibility for maintaining a high standard of code through thoughtful PR reviews.
