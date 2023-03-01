---
layout: default
title: List Running Stages
parent: Developer Guide
nav_order: 9
---

# List Running Stages
{: .no_toc }

How to get a list of currently running stages for this project in the current AWS account.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### List Running Stages

#### Summary
This returns a list of currently running stages for this project in the current AWS account.

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Use the run script:
  ```bash
    nvm use
    run listRunningStages
  ```

#### Notes
- None

### Run Report using GitHub Actions

#### Summary
This project uses [GitHub Actions](https://github.com/features/actions) as its CI/CD tool.

Each of our repositories has a GitHub Actions workflow added to run this list running stages command and report the results to slack on a schedule.  This workflow may also be manually invoked.

#### Prerequisites:
- Git repo access; complete the Git access request portion of [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})
- Access to CMS slack to see the generated report.

#### Procedure
- Browse to the actions page of the repository in GitHub, select the "Running Stage Notifier" workflow and press run workflow.

#### Notes
- None
