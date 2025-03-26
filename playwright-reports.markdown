---
layout: page
# the header for the page
title: "Playwright Reports"
# the link to page https://jekyllrb.com/docs/permalinks/
permalink: playwright-reports/
---

<div>
  <h2>Main
</h2>
  <!-- Get the data from `_data/playwright-reports/main.json` and assign it to a variable called `data`. -->
{% assign data = site.data.playwright-reports.main %}
  <!--
    Include the html snippet in `_includes/playwright-summary.html` with the parameters "main" as `branch`,
    the data variable as `data`, and "/playwright-reports/main.html" as `url`.
  -->
  {% include playwright-summary.html branch="main" data=data url="/playwright-reports/main.html" %}

    <div class="mt-8">
    <h2>Latest Reports from Branches
  </h2>
    <!-- Include the html snippet in `_includes/playwright-branch-list.html` -->
    {% include playwright-branch-list.html %}
  </div>
</div>
