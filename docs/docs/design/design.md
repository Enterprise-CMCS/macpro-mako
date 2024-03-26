---
layout: default
title: Design
nav_order: 3
has_children: true
permalink: docs/design
---

# Design
{: .no_toc }

This is a place where you can find more about the design and history of different pieces of the application.
{: .fs-6 .fw-300 }

The {{ site.repo.name }} project is a [serverless monorepo](https://serverless-stack.com/chapters/organizing-serverless-projects.html). It is, for the most part, a collection of standalone Serverless Framework micro services bound together in a repository. Loose coupling of the micro services is facilitated using one or several tools, which include CloudFormation outputs, AWS Systems Manager Parameter Store paramters, and AWS Secrets Manager stores. This section will describe each service in a high level of detail.
