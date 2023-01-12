---
layout: default
title: Services
nav_order: 3
has_children: true
permalink: docs/services
---

# Services
{: .no_toc }

Details on each Serverless service
{: .fs-6 .fw-300 }

The {{ site.repo.name }} project is a [serverless monorepo](https://serverless-stack.com/chapters/organizing-serverless-projects.html). It is, for the most part, a collection of standalone Serverless Framework services bound together in a repository. Loose coupling of the services is facilitated using one or several tools, which include CloudFormation outputs, AWS Systems Manager Parameter Store paramters, and AWS Secrets Manager stores. This section will describe each service in a high level of detail.
