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
- emailSource: the single email address to place in the From: field of the email.  Must be a verified email in the AWS SES service being used.
- emailRecipients: a JSON object containing the email address type to actual email addresses mappings
{ "OSG":"spa@cms.hhs.gov","}