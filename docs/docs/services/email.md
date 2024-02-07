---
layout: default
title: email
parent: Services
---

# email
{: .no_toc }

## Summary
The email service deploys the lambdas, SNS topics, and Configuration Sets needed to send email.

## Detail
AWS SES is an account-wide service for basic sending and receiving of email.  By creating lambdas to build the emails and sending the email with a branch-specific configuration set, we can follow the events of email sending and take action based on those events.

### SSM Parameters
The workflow will not successfully deploy unless the following ssm parameters are set:
- {project}/default/emailSource or {project}/{stage}/emailSource: the single email address to place in the From: field of the email.  Must be verified at the account level.
- {project}/default/osgEmail or {project}/{stage}/osgEmail: the actual email address used for emails configured to be sent to the OSG Email.