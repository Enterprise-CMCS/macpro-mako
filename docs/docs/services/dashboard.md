---
layout: default
title: dashboard
parent: Services
---

# dashboard
{: .no_toc }

## Why do I need this?
Part of any good project is a way to determine how well it is working. The purpose of a `CloudWatch Dashboard` is to determine the performance, health, and a variety of other aspects that factor into the product being delivered. What we have done here is provided an easy to use solution that will make creating a dashboard easy and deploying it even easier.

## Quick Disclaimer
In order to add the dashboard to existing projects it is important to note that is relies on consistant namespacing across aws services. It must be able to distinguish things such as the project and branch name for example.

## Getting Started
In order to use the CloudWatch Dashboard you must bring over the dashboard folder which is located in the `src/services/` directory of this repo. Where this folder gets added is entirely dependant upon the structure of the project it's being added to, but the good news is that this service has no dependencies on other services (meaning it is standalone).

## Making edits to the Dashboard
Once the dashboard is deployed to the AWS account it can be found in the CloudWatch Dashboards section by the name of `${stage-name}-dashboard`.

Edits can be made to this dashboard and when edits are complete simply save the dashboard and then click on the `generate template` button. The contents in here are what the `templateDashboard.txt` file should consist of. A simple copy, paste, and commit later and the changes are now ready to be deployed to higher environments.
