---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

<div>
  <div>
    <h2>Playwright</h2>
    {% assign data = site.data.playwright-reports.main %}
    {% include playwright-summary.html branch="main" data=data url="/macpro-mako/playwright-reports/main.html" %}
  </div>

  <div style="margin-top:2rem;">
    <h2>Code Coverage</h2>
    {% assign total = site.data.coverage.coverage-summary.total %}
    {% include coverage-summary.html branch="main" total=total %}
  </div>
</div>
