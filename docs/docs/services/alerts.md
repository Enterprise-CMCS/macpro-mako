---
layout: default
title: alerts
parent: Services
nav_order: 1
---

# alerts
{: .no_toc }

#### Summary

The alerts service deploys a Simple Notification Service (SNS) topic to REGION_A.  This topic can be leveraged by any other service for sending alerts.

#### Notes

- To subscribe an email, phone number, or something else to the topic, find the SNS topic using the AWS Console and add the subscription manually.
- No SNS subscriptions are made by the deployment process. The topic is created, and several other services are configured to publish notifications to the topic, but the topic itself is not automatically configured to fan out any notifications. Here's why:
  - Since dev environments may receive many notifications due to failures related to development, and since those notifications can be noisy, we likely never want to automatically subscribe to dev environments' SNS topics.
  - We likely only want to subscribe to notifications for higher/long running environments like master, val, and production.
  - Manually adding the subscription to higher environments was judged to be low effort, as it's a one-time operation.
  - After adding an email as a subscriber to SNS, the email must be confirmed by clicking a link in a confirmation email. This added to the decision to handle subscriptions manually, as a human would need to verify the email manually even if the subscription was made automatically.
- The SNS topic ARN is injected via a serverless compose parameter (see [serverless-compose.yml](../blob/master/serverless-compose.yml)) so other services can be configured to publish to it.