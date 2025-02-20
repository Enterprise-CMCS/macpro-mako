---
title: "Playwright Reports"
permalink: playwright-reports/
---

<div>
    <h2>Main</h2>
    {% assign data = site.data.playwright-reports.main %}
    {% assign url = "/playwright-reports/main.html" | relative_url %}
    {% include playwright-summary.html branch="main" data=data url=url %}

    <div class="branch-reports">
        <h2>Latest Reports from Branches</h2>
        {% include playwright-branch-list.html %}
    </div>
</div>
