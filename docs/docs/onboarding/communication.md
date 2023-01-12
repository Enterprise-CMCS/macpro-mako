---
layout: default
title: Communication
parent: Onboarding
nav_order: 3
---

# Communication
{: .no_toc }

Here's how our team communicates.
{: .fs-6 .fw-300 }
**Note:  Account access should be your first step in onboarding, as the requests can take time to complete.**

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

## Recurring Meetings

Here's a list of recurring meetings you might need.  If you need or want an invite, reach out on [Slack]({{ site.slack.channel_url}} ).

| Meeting | Day(s) | Time | Link |
| ------- | ------ | ---- | ---- |
|{% for element in site.meetings %} {{ element.name }} | {{ element.days }} |{{ element.time }} | {{ element.link }} |
{% endfor %}

## Slack

We love Slack.  Our primary means of synchronous and/or ad hoc communication is our project [Slack channel]({{ site.slack.channel_url }}).  All developers and stakeholders should join the channel, and feel free to put any kind of project related information in it.  Questions, comments, discussions about failing builds, "is anyone available to help me?", "i'm going to be out for a few hours", "check out this cool new thing I found", "good morning everyone", etc. can all go in the Slack channel.  

Please note that comments related to Pull Requests and Issues are best made on those objects.  For example:  putting a comment about a Pull Request in Slack is generally inappropriate, as the Pull Request is then not a complete record of what occurred.  

However, and please remember this:  do what you feel is best.  Discretion is what allows us to move fast, so don't be afraid to break the guidelines.

## Jira

We use Jira to document work items.  This should be the place where ideas are written down, where acceptance criteria is developed, and where questions/comments/concerns pertaining to the work should take place.  Specifically, you probably don't want to comment on a work item or its content in Slack, as it's very valuable to have the entire development process on record in the Jira Task/Story.  So, put work item related content in the Task as much as possible.

## GitHub Pull Requests (PRs)

GitHub Pull Requests are the primary vehicle to propose code changes to {{ site.repo.name }}.  A PR is always used to ship code to the master branch, with very few exceptions.

This project has PR templates which will be used automatically when you create a PR.  While the template sets up a PR with the fields that are typically required, you need to add the content to the various sections.

When authoring a PR, you typically want to be as descriptive as possible.  The goal is to write a PR as a complete description of the changeset, so that the PR and any underlying Issue can completely communicate the changes being made to someone otherwise unfamiliar with the work.  We want to be able to look back at the PR in a month, six months, or years on, and be able to fully understand what was changed and why.  Your audience for PRs are your peers, non technical stakeholders, and your future self.  High quality PRs are a hallmark of successful and maintainable projects; don't go short on them.

## Email

We don't like email.  However, it is used for access requests, onboarding, communication with external entities, and/or for any other communication that's difficult to facilitate another way.  

Don't hesitate to send an email if there's not a better way (do what you think is best), but avoid it by rule and use it by exception.

