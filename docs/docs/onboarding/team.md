---
layout: default
title: Team Introduction
parent: Onboarding
nav_order: 1
---

# Team Introduction
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

### Meet the team

A list of a few important roles and people on the project (not comprehensive!):

| Role | Description | Team Member | Email |
| ---- | ----------- | ----------- | ----- |
|{% for element in site.team.members %} {{ element.role }} | {{ element.description }} | {{ element.name }} | {{ element.email }} |
{% endfor %}


### Core Work Hours

Core Team work hours are {{ site.team.core_hours }}.

We strive to do most work asynchronously, as we are spread across timezones and have others demands on our time. Using Pull Request reviews and comments, Slack, and email are examples of ways we try to keep things async. However, we strive to be available online for meetings and pair programming during this time window.