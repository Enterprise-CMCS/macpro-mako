---
---

<div class="reports">
  <div class="main-reports">
    <h2>Main</h2>

    <h3>Code Coverage</h3>
    <!--
      Jekyll provides access to YAML, JSON, CSV, and TSV in the `_data` directory using `site.data`. It supports retrieving data nested in directories, files, and objects. https://jekyllrb.com/docs/datafiles/
  
      Get the data from the `total` field in `_data/coverage/coverage-summary.json` and assign it to a variable called `total`.
    -->
    {% assign total = site.data.coverage.coverage-summary.total %}
    <!--
      Jekyll uses includes to create reusable snippets of html code. Data can be passed through to the snippet using parameters. https://jekyllrb.com/docs/includes/
    
      Include the html snippet in `_includes/coverage-summary.html` with the parameters "main" as `branch` and the totals from the data as `total`.
    -->
    {% include coverage-summary.html branch="main" total=total %}

    <h3>Playwright</h3>
    <!--
      Get the data from `_data/playwright-reports/main.json` and assign it to a variable called `data`.
    -->
    {% assign data = site.data.playwright-reports.main %}
    <!--
      Jekyll uses Liquid filters to provide helper functions. https://jekyllrb.com/docs/liquid/filters/
    -->
    <!--
      Include the html snippet in `_includes/playwright-summary.html` with the parameters "main" as `branch`,
      the data variable as `data`, and "/playwright-reports/main.html" as `url`.
    -->
    {% include playwright-summary.html branch="main" data=data url="/playwright-reports/main.html" %}
  </div>

  <div class="branch-reports">
    <h2>Latest Reports from Branches</h2>
    <!-- Include the html snippet from `_includes/playwright-branch-list.html` -->
    {% include playwright-branch-list.html %}
  </div>
</div>
