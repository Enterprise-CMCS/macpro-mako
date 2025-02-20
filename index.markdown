---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

<div class="reports">
  <div class="main-reports">
    <h2>Main</h2>
    
    <h3>Code Coverage</h3>
    {% assign total = site.data.coverage.coverage-summary.total %}
    {% include coverage-summary.html branch="main" total=total %}

    <h3>Playwright</h3>
    {% assign data = site.data.playwright-reports.main %}
    {% assign url = "/playwright-reports/main.html" | relative_url %}
    {% include playwright-summary.html branch="main" data=data url=url %}
  </div>
  <div class="branch-reports">
    <h2>Latest Reports from Branches</h2>
    {% include playwright-branch-list.html %}
  </div>
</div>
