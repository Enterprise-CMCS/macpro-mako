---
layout: default
title: Security Hub Jira Sync
parent: GitHub Workflows
nav_order: 1
---

# Security Hub Jira Sync
{: .no_toc }

Reflect our active Security Hub findings in Jira.
{: .fs-6 .fw-300 }
---

## Summary

CMS projects deployed in AWS are required to resolve [Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html) findings according to the following schedule:
- Critical vulnerabilities within 15 days from discovery
- High vulnerabilities within 30 days from discovery
- Moderate (MEDIUM) vulnerabilities within 90 days from discovery
- Low vulnerabilities within 365 days from discovery

The security-hub-jira-sync workflow exists to get Security Hub findings in a project's AWS account(s) into Jira and in front of the developers equipped to resolve them.  The workflow works by running the [macpro-security-hub-sync npm package](https://www.npmjs.com/package/@enterprise-cmcs/macpro-security-hub-sync) on a cron, scheduled for every other hour during business hours.  Please see the npm packages documentation for more details.  In short:  when the package is run, the master branch's AWS account is scanned for SecHub findings, those finding types get issues created in Jira, and any resolved SecHub issues that have a Jira issue have their issue closed.

## Configuration, Notes, YSK

### Set ENABLE_SECURITY_HUB_SYNC actions variable
The security hub workflow is unique, in that it should ideally only be run by one project per AWS account.  Since security hub findings are scoped to the account, and since we can have many projects deployed to a given account, multiple instances of the security hub workflow running is not ideal.  It is rather harmless if two projects in the same account were both running the workflow, but it's best avoided. 

To that end, a new project based off this repo will not run this workflow automatically.  There is an environment variable flag that must be set before the job will run.

To enable the security-hub-jira-sync workflow, set a repository variable named 'ENABLE_SECURITY_HUB_SYNC' to any value.  The existence of the variable is what is checked, not its value.  To set a GitHub actions secret, follow the same steps as creating an Actions secret, but look for a tab that says 'Variables'.  These function just like secrets in their scope, but are unencrypted. 

### Set JIRA_USERNAME and JIRA_TOKEN as github secrets

Per the [macpro-security-hub-sync](https://www.npmjs.com/package/@enterprise-cmcs/macpro-security-hub-sync) docs, you'll need to create username and token secrets for a jira user.  The token is more accurately called a Personal Access Token (PAT) in Jira, and can be created by logging into Jira in a web browser and following [these instructions](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html#UsingPersonalAccessTokens-CreatingPATsintheapplication).

On MACPro, we use a service user; you probably should, too.  If you're on MACPro, you may be able to leverage our existing service user; reach out to {{ site.contact_email }} or Nathan O'Donnell about possible access.

### Review/Update the JIRA_HOST and JIRA_PROJECT settings

In the [workflow definition](../../../.github/workflows/security-hub-jira-sync.yml), there are hardcoded values for JIRA_HOST and JIRA_PROJECT.  These values are what all projects on MACPro should use, so we've kept it simple and put them directly in the file.  If you're not on MACPro or need to change these values, make the appropriate updates to the file.

### Review/Update the custom fields in src/run.ts

Some Jira projects require certain fields to be set for issues to be created.  This is the case with MACPro's Jira installation.  We have two fields that must be set.  These fields are set in the [run script](../../../src/run.ts).  You'll note two lines that begin with 'customfield_'.  Unfortunately, we must set the actual id and value of the custom field as Jira expects it.  These ids will vary from instance to instance, even if the field name is the same.  Despite our best efforts, the complexity and number of options and allowances when setting custom fields makes it incredibly difficult to have a more user friendly experience; you must find the customfield id's for the values you must set.  If you're on MACPro and use our Jira, these are the field values you need, which map to Working Team and Product Supported.  If you're not on MACPro and using a different Jira, trial and error is usually fine; the package will surface the Jira API error as it says 'customfield_1234 is not set, Product Supported is not set'.  In other words, you can look carefully at the fail output to find the id names.  Alternatively, you may also query the Jira API and be more exact about it.

In any event, you probably want to update the Working Team from Platform Team to your team name.

### YSK the workflow only runs on the default branch

On MACPro, we typically use three separate levels of AWS accounts for each project:
- dev account:  this holds the default branch (master) enviroment along with all ephemeral branches/environments.
- impl account:  this holds the val environment built from the val branch.
- production account:  this holds the production environment built from the production branch.

Obviously, the sechub workflow needs to authenticate and talk to AWS.  It gets the arn of the role to assume from a github secret.  What you should know is:  the scheduled/crond workflow will only kick off on the default/master branch; this is how cron'd workflows behave.  This means that your workflow will only automatically manage findings in Jira for the dev aws account.  If/when you'd like to scan the impl/production accounts for findings, you may manually run the security hub workflow (workflow_dispatch action) from the GitHub UI.  When triggering a build, it will ask off of which branch it should run; you may select val or production as you wish.

You might be wondering:  why can't we work around this?  Good question; and the answer is 'we could'.  But there are bigger obstacles to automated val/production runs than the cron behavior.  For instance, our OIDC role's trust policy pattern will only allow workflows run off of the true val or production branch to assume the aws service role, respectivelly.  To add to the issues, if we were to build a mechanism to trigger security hub sync off of val or production so we could assume the role, GitHub would require an administrator to approve the workflow's access to the Environment holding the role arn before it would be allowed to continue.  This is all by design, and all very good ideas.  By design, having automatic and unattended builds run against val and production is not possible, or at least very difficult.

In summary:  you will only get automatic sec hub scanning for the dev account, which should go a long way to keeping the higher environments safe from vulnerabilities brought about by vulnerable code.  Scanning impl and production must be done by manually running the workflow ad hoc, which can be accomplished through the GitHub UI.