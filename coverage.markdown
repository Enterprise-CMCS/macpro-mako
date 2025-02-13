---
title: "Code Coverage Report"
permalink: coverage-report/
custom_css: coverage
---

<div>
  {% assign total = site.data.coverage.coverage-summary.total %}
  {% include coverage-summary.html branch="main" total=total %}
</div>
