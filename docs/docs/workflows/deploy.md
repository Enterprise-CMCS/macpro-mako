---
layout: default
title: Deploy
parent: GitHub Workflows
nav_order: 3
---

# Deploy
{: .no_toc }

Deploys the stage
{: .fs-6 .fw-300 }
---

## Summary

This GitHub workflow deploys an application to AWS and performs various tests and checks on the resources deployed. It consists of several jobs:

1. **init**: This job validates the name of the branch and ensures that it adheres to the naming convention used by the Serverless Framework.

2. **deploy**: This job deploys the application to AWS using the Serverless Framework. It checks out the source code, configures AWS credentials, and deploys the application using the `run deploy` command.

3. **test**: This job runs automated tests on the deployed application. It checks out the source code, configures AWS credentials, and runs the tests using the `run test` command.

4. **cfn-nag**: This job performs a static analysis of the AWS CloudFormation templates used by the application. It checks out the source code, configures AWS credentials, and uses the `stelligent/cfn_nag` action to analyze the templates.

5. **resources**: This job retrieves information about the resources deployed to AWS by the application. It checks out the source code, configures AWS credentials, and uses the `aws cloudformation list-stack-resources` command to retrieve information about the resources deployed.

6. **release**: This job creates a release of the application. It checks out the source code, configures AWS credentials, and creates a GitHub release with the artifacts produced by the `test`, `cfn-nag`, and `resources` jobs.

## Workflow Details

- **Name:** Deploy
- **Triggers:** This workflow is triggered on every push to any branch, except for branches that start with "skipci".
- **Concurrency:** This workflow is limited to one concurrent run per branch.
- **Environment Variables:**
  - `STAGE_NAME`: The name of the deployment stage. This is set to the name of the branch by default.
- **Permissions:**
  - `id-token`: write
  - `contents`: write
  - `issues`: write
  - `pull-requests`: write
- **Jobs:**
  1. **init:**
    - **Runs on:** Ubuntu 20.04
    - **Steps:**
      - Validate the stage name
  2. **deploy:**
    - **Runs on:** Ubuntu 20.04
    - **Needs:** init
    - **Environment:** `STAGE_NAME`
    - **Steps:**
      - Checkout the source code
      - Use the `aws-actions/configure-aws-credentials` action to configure AWS credentials
      - Deploy the application using the `run deploy` command
  3. **test:**
    - **Runs on:** Ubuntu 20.04
    - **Needs:** deploy
    - **Environment:** `STAGE_NAME`
    - **Steps:**
      - Checkout the source code
      - Use the `aws-actions/configure-aws-credentials` action to configure AWS credentials
      - Run automated tests using the `run test` command
  4. **cfn-nag:**
    - **Runs on:** Ubuntu 20.04
    - **Needs:** deploy
    - **Environment:** `STAGE_NAME`
    - **Steps:**
      - Checkout the source code
      - Use the `aws-actions/configure-aws-credentials` action to configure AWS credentials
      - Use the `stelligent/cfn_nag` action to perform a static analysis of the AWS CloudFormation templates
  5. **resources:**
    - **Runs on:** Ubuntu 20.04
    - **Needs:** deploy
    - **
