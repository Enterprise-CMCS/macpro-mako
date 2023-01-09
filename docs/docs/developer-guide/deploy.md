---
layout: default
title: Deploy a Stage
parent: Developer Guide
nav_order: 3
---

# Deploy a Stage
{: .no_toc }

How-to deploy a new or existing stage to AWS.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Deploy a stage

#### Summary
This deploys the entire application, so the entire stage, to AWS.

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Deploy using the run script:
  ```bash
    cd {{ site.repo.name }}
    nvm use
    run deploy --stage foo
  ```

#### Notes
- None

### Deploy an individual service

#### Description
This will deploy a single service for a given stage.  All other services on which your target service is dependent must already be deployed for the stage.  For example:  if service B depends on service A, and you want to use this procedure to deploy only service B, then service A must have already been deployed.

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Deploy using the run script:
  ```bash
    cd {{ site.repo.name }}
    nvm use
    run deploy --service bar --stage foo
  ```

#### Notes
- None

### Deploy using GitHub Actions

#### Summary
This project uses [GitHub Actions](https://github.com/features/actions) as its CI/CD tool.  For the most part, this project also adheres to [GitOps](https://www.gitops.tech/).  That said...

Each branch pushed to the {{ site.repo.name }} git repository is automatically deployed to AWS.  GitHub Actions sees the 'push' event of a new branch, and runs our Deploy.yml workflow.  After a few minutes, the branch will be fully deployed.  This 1:1 relationship between git branches and deployed stages is the reason why 'stage' and 'branch' are sometimes used interchangeably to refer to a deployed set of the application.

#### Prerequisites:
- Git repo write access; complete the Git access request portion of [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Create a new branch based off of any other branch or commit.  The 'master' branch is the most common branch from which to create new branches, and is shown in the following procedure.:
  ```bash
    cd {{ site.repo.name }}
    git checkout master
    git pull
    git checkout -b foo
    git push --set-upstream origin foo
  ```
- Monitor the status of your branch's deployment in the repo's [Actions area](https://github.com/{{ site.repo.org }}/{{ site.repo.name }}/actions).

#### Notes
- None