---
title: "Playwright Reports"
permalink: playwright-reports/
---

<div>
    <h2>Main</h2>
    {% assign data = site.data.playwright-reports.main %}
    {% include playwright-summary.html branch="main" data=data url="/playwright-reports/main.html" %}

    <h2>Latest Reports from Branches</h2>
    {% include playwright-branch-list.html %}
</div>
