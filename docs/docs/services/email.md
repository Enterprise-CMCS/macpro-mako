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

### Secrets Manager
The workflow will not successfully deploy unless the emailAddressLookup object is defined:

Named {project}/default/emailAddressLookup or {project}/{stage}/emailAddressLookup
    {   
        "sourceEmail":"\"CMS MACPro no-reply\" <spa-reply@cms.hhs.gov>",
        "osgEmail":"\"OSG\" <mako.stateuser@gmail.com>",
        "chipInbox":"\"CHIP Inbox\" <mako.stateuser@gmail.com>",
        "chipCcList":"\"CHIP CC 1\" <mako.stateuser@gmail.com>;\"CHIP CC 2\" <mako.stateuser@gmail.com>",
        "dpoEmail":"\"DPO Action\" <mako.stateuser@gmail.com>",
        "dmcoEmail":"\"DMCO Action\" <mako.stateuser@gmail.com>",
        "dhcbsooEmail":"\"DHCBSOO Action\" <mako.stateuser@gmail.com>"
    }

These values are set during deployment as environment variables on the lambda.  You can edit these values in the AWS Console on the Lambda configuration tab.

LAUCH NOTE!!! The defined email addresses have been stored as om/default/emailAddressLookup in the production account, with om/production/emailAddressLookup overwriting those email addresses with the test email addresses.  Delete the om/production/emailAddressLookup before the real launch deploy (you can also edit the environment variables after the lambda is built). 

### Test accounts
There are gmail accounts created to facilitate email testing.  Please contact a MACPro team member for access to these inboxes.  At this time, there is only one available email inbox.
- mako.stateuser@gmail.com - a state user account  - does have an associated OneMAC login 

### Templates
The email services uses the serverless-ses-template plugin to manage the email templates being used for each stage.  To edit the templates, edit index.js in ./ses-email-templates.  Each template configuration object requires:
- name: the template name (note, the stage name is appended to this during deployment so branch templates remain unique to that stage).  At this time, the naming standard for email templates is based on the event details. Specifically, the action and the authority values from the decoded event.  If action is not included in the event data, "new-submission" is assumed.
- subject: the subject line of the email, may contain replacement values using {{name}}.
- html: the email body in html, may contain replacement values using {{name}}.
- text: the email body in text, may contain replacement values using {{name}}.