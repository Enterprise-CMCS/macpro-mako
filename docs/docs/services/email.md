---
layout: default
title: email
parent: Services
---

# data
{: .no_toc }

## Summary
The email service deploys the lambdas, SNS topics, and Configuration Sets needed to send email.

## Detail
AWS SES is an account-wide service for basic sending and receiving of email.  By creating lambdas to build the emails and sending the email with a branch-specific configuration set, we can follow the events of email sending and take action based on those events.