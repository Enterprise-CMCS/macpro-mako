---
layout: default
title: Jira Issue Commenter
parent: GitHub Workflows
nav_order: 2
---

# Jira Issue Commenter
{: .no_toc }

Automatically links Pull Requests to Jira Issues mentioned in the PR body.
{: .fs-6 .fw-300 }
---

## Summary

The {{ site.repo.name }} project uses GitHub Pull Requests to review and merge and code change.  A GitHub pull request is a feature that allows developers to propose changes to a project's codebase. When a developer wants to suggest changes to a project, they create a pull request which includes the code changes they've made. The pull request then allows other developers to review the proposed changes, discuss any potential issues, and ultimately merge the changes into the main codebase.

The {{ site.repo.name }} project uses Jira to plan, schedule, and track development work items.

As a general rule, most pull requests should be related to a Jira Issue.  In fact our PR template has a section where you may list related issues.

The auto-create-jira-comment workflow is meant to scan pull requests for Jira Issue links; any issues that it finds receives a new comment "This issue was referenced on (link to pull request)".  If it finds no issue links in the PR, nothing happens.  If it finds one, two, or 'n' issues, they all receive that same "This issue was referenced..." comment.  While this workflow will not automatically close issues in Jira, it works to create that link between work item and pull request, provided the team can add Jira Issue links to PRs.

## Configuration, Notes, YSK

### Set JIRA_USERNAME and JIRA_TOKEN as github secrets

The workflow file expects two secrets to be set, JIRA_USERNAME and JIRA_TOKEN.  IF they're not set, the workflow will not fail, but it will be unable to comment on Jira issues.

You'll need to create username and token secrets for a jira user.  The token is more accurately called a Personal Access Token (PAT) in Jira, and can be created by logging into Jira in a web browser and following [these instructions](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html#UsingPersonalAccessTokens-CreatingPATsintheapplication).

On MACPro, we use a service user; you probably should, too.  If you're on MACPro, you may be able to leverage our existing service user; reach out to {{ site.contact_email }} or Nathan O'Donnell about possible access.

Load these values for JIRA_USERNAME and JIRA_TOKEN into the repository's actions secrets, and the workflow functionality will be operational.

### Review/Update the JIRA_BASE_URL in the workflow file

In the [workflow definition](../../../.github/workflows/autom-create-jira-comment.yml), there is a hardcoded value for JIRA_BASE_URL.  This is used to more precisely find Jira issue links.  As this value is the same for MACPro projects, it was hardcoded to reduce configuration burden.  But if your project uses a different Jira than the one listed, update this value to your Jira base url.