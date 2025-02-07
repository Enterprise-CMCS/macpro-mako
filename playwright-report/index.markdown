---
layout: page
title: "Code Coverage Reports"
category: playwright-report
permalink: playwright/
custom_css: report
---

{% assign main-report = site.data.playwright-report.main.playwright-summary %}
{% include playwright-summary.html url="/playwright-report/main/index.html"
title="Main" stats=main-report.stats errors=main-report.errors %}
