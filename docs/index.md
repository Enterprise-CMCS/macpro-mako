---
layout: default
title: Home
nav_order: 1
description: "The home page."
permalink: /
---

# {{site.title}}
{: .fs-9 }

{{ site.description }}
{: .fs-6 .fw-300 }

[Get started now](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [View it on GitHub]({{ site.repo.url }}){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Welcome!

The {{ site.repo.name }} project, a.k.a. MAKO, a.k.a. Micro, is a redesign of MACPRO Onemac. The mission to be a modern submission and review portal for select CMS data remains the same, but the architecture is different in some important ways.

This documentation site is a WIP and currently shows outdated information, as the project hasn't quite reached the 'norming' phase yet.  Thank you for your patience.

---

## About the project

The {{ site.repo.name }} project is a work of the [Centers for Medicare & Medicaid Services (CMS)](https://www.cms.gov/).


#### Thank you to the contributors of {{ site.repo.name }}!

<ul class="list-style-none">
{% for contributor in site.github.contributors %}
  <li class="d-inline-block mr-1">
     <a href="{{ contributor.html_url }}"><img src="{{ contributor.avatar_url }}" width="32" height="32" alt="{{ contributor.login }}"/></a>
  </li>
{% endfor %}
</ul>
