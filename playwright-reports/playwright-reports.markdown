---
title: "Playwright Reports"
permalink: playwright-reports/
---

<div>
    <h2>Main</h2>
    {% assign data = site.data.playwright-reports.main | first %}
    {% include playwright-summary.html data=data %}

    <h2>Latest Reports from Branches</h2>
    {% include playwright-branch-list.html %}
</div>
