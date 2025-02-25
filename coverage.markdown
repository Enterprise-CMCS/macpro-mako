---
# the header for the page
title: "Code Coverage Report"
# the link to page https://jekyllrb.com/docs/permalinks/
permalink: coverage-report/
---

<div>
  <!--
    Get the data from the `total` field in `_data/coverage/coverage-summary.json` and assign it to a variable called `total`.
  -->
  {% assign total = site.data.coverage.coverage-summary.total %}
  <!--
    Include the html snippet in `_includes/coverage-summary.html` with the parameters "main" as `branch` and the totals from the data as `total`.
  -->
  {% include coverage-summary.html branch="main" total=total %}
</div>
