---
layout: default
title: AWS Login
parent: Developer Guide
nav_order: 1
---

# AWS Login
{: .no_toc }

Authenticating to an AWS account(s) is a required first step for many workflows.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

### AWS Console Login

#### Summary
This procedure will take you to the AWS Console in a web browser, for one of the AWS accounts used by this project.

#### Prerequisites
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
To get to the AWS Console:
- Login to the cloud VPN, https://cloudvpn.cms.gov
- Go to the CMS [Kion (Cloudtamer) site](https://cloudtamer.cms.gov/login).  This is a great link to bookmark.  Note: if the Kion site fails to load in your browser, it is very likely an issue with your VPN.  The Kion site is only accessibly while actively on the VPN.
- Login with your CMS EUA credentials.
- Select the drop down menu next to the appropriate account.
- Select Cloud Access Roles
- Select the role you wish to assume.
- Select Web Access.  The AWS Console for the account should open in a new browser tab.  Once the console is open, you may close your VPN connection, if you wish.

#### Notes
- Once connected to the AWS Console, you can close your VPN connection if you'd like.  The VPN is only needed when authenticating to Kion and gaining AWS credentials.
- Your browser session is valid for up to 4 hours.  After 4 hours, you will need to redo this procedure.

### AWS CLI credentials

#### Summary
This procedure will show you how to retrieve AWS CLI credentils for one of the AWS accounts used by this project, granting you programmatic access to AWS.  This is required for any operations you may run directly against AWS.

#### Prerequisites
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- Login to the cloud VPN, https://cloudvpn.cms.gov
- Go to the CMS [Kion (Cloudtamer) site](https://cloudtamer.cms.gov/login).  This is a great link to bookmark.  Note: if the Kion site fails to load in your browser, it is very likely an issue with your VPN.  The Kion site is only accessibly while actively on the VPN.
- Login with your CMS EUA credentials.
- Select the drop down menu next to the appropriate account.
- Select Cloud Access Roles
- Select the role you wish to assume.
- Select 'Short-term Access Keys'.
- Click the code block under 'Option 1', to copy the AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN environment variables to your clipboard.
- Navigate to a terminal on your mac, and paste the credentials.  You should now be able to interact with AWS programmatically, based on the role you selected in Kion.

#### Notes
- There are three available options when getting access keys from Kion.  The instructions above detail Option 1, which is essentially copying and pasting env variables to a terminal.  Feel free to use one of the other options if you'd prefer.  For sake of simplicity, Option 1 will be the only one documented and supported here.
- Once you have credentials from Kion, you can close your VPN connection if you'd like.  The VPN is only required when talking to Kion to obtain credentials.
- The credentials are valid for 4 hours, after which you'll need to redo this procedure.