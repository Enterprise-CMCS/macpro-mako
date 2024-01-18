---
layout: default
title: Access Requests
parent: Onboarding
nav_order: 2
---

# Access Requests
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

Please follow these steps to gain access to Snyk:
1. Request / Confirm EUA job code: ENT_APPSEC_TOOLS: Access to Enterprise Application Security Tools: Snyk
2. Login to Enterprise User Administration (EUA)
3. Select View My Identity
4. Select the "Job Codes" tab
5. Review your current Job Codes.  Do you have ENT_APPSEC_TOOLS?
6. If no, request job code ENT_APPSEC_TOOLS
- On the “Task” sidebar select “Modify My Job Codes
- Be sure to select the “*Confirmation (Required) check box
- Select Next
- At the bottom left of the page select “Add a Job Code”
- Enter the job code you want to add, In this case ENT_APPSEC_TOOLS and select “Search”
- Check the select box and click the “Select” bottom.
- Click “Next”
- Enter a “Justification Reason” and select “Finish”
- Example: I am a CMS contractor, requesting Access to Enterprise Application Security Tools: Snyk order to support development and maintenance of the suite of MACPRO systems supported by Fearless and it’s sub-contractors under Primary Contract Number: GS-35F-115GA:75FCMC22F0093:
- Now wait for the request to be approved. You need ENT_APPSEC_TOOLS before the cloud team will setup your access.
7. Let me know when each user has confirmed that you have the ENT_APPSEC_TOOLS the Job Code and I will send a Snyk invite the email address associated with their EUA ID.

## Code Climate

We use [Code Climate](https://codeclimate.com/) to monitor project quality.  This includes running maintainability checks for Pull Requests, which flags code that doesn't meet best practices.  Checks include function length, file length, cognitive complexity, and duplication.

Code Climate is a completely external tool which is free to use.  You may go to Code Climate and create a new account.  We recommend you sign up with GitHub, for convenience, so you won't need to maintain a separate username and password.

Once you have an account, you may view any repositories for which you have access.  For private repositories, you will not be able to view the repository in Code Climate until you have Git repository write access (see above).