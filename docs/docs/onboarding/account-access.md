---
layout: default
title: Account Access
parent: Onboarding
nav_order: 2
---

# Account Access
{: .no_toc }

You'll need access to a few systems to be a fully privileged developer.  This section will guide you in making the necessary access requests.  
{: .fs-6 .fw-300 }
**Note:  Account access should be your first step in onboarding, as the requests can take time to complete.**

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

## Git organization

To be a fully privileged developer on the {{ site.repo.name }} project, you will need access to both the GitHub organization and the repository.

Access to the GitHub organization is governed by a CMS team and CMS Job Codes.  Please follow the [instructions to obtain org access](https://qmacbis.atlassian.net/l/cp/xe4XCoGo).

## Git Repository

To be a fully privileged developer on the {{ site.repo.name }} project, you will need access to both the GitHub organization and the repository.

To be granted access to the repo:, please send an email to {{ site.contact_email }} which includes:

- Name
- GitHub user id
- Level of access requested (read, write, admin, maintain)
- Reason for access / who you are

## AWS and Cloud VPN

The {{ site.repo.name }} project is deployed to a designated set of three AWS accounts.  While many workflows can be done without direct AWS Console/CLI access, a fully equipped developer will need AWS access.

Further, accessing the AWS Console or CLI requires fetching temporary credentials from a service called Kion.  This service is behind the CMS Cloud VPN.

So, to have full AWS access, you will need two things:  access to the Cloud VPN so you can hit Kion, and then permissions for the project's specific AWS accounts.  CMS requests to be granted access to these two systems can be made together, or seperately.

Please [follow this how-to guide](https://qmacbis.atlassian.net/l/cp/yY5s5is2) to obtain access to AWS and the Cloud VPN.

## Zscaler VPN

This project communicates with Seatool.  Sometimes, during development, access to the Seatool frontend is helpful.  To gain access to it, you must first get access to the Zscaler VPN.

Please follow these [instructions to gain access to Zscaler](https://qmacbis.atlassian.net/wiki/spaces/DE/pages/3180560407/How+to+get+access+to+CMS+Zscaler+VPN+Access).


## Snyk

Snyk is a software tool that specializes in identifying and resolving security vulnerabilities in code dependencies and performing static code analysis. It scans project dependencies for known security issues and provides recommendations for fixing them, enhancing code security.

CMS has a Snyk installation that our project ties into.  It can be found [https://snyk.cms.gov/](here).  Access is governed by a CMS job code, as well as Snyk permissions.

Please follow the [instructions to gain Snyk access](needlink).

## Code Climate

We use [Code Climate](https://codeclimate.com/) to monitor project quality.  This includes running maintainability checks for Pull Requests, which flags code that doesn't meet best practices.  Checks include function length, file length, cognitive complexity, and duplication.

Code Climate is a completely external tool which is free to use.  You may go to Code Climate and create a new account.  We recommend you sign up with GitHub, for convenience, so you won't need to maintain a separate username and password.

Once you have an account, you may view any repositories for which you have access.  For private repositories, you will not be able to view the repository in Code Climate until you have Git repository write access (see above).