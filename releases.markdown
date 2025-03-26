---
layout: page
title: Release Notes
permalink: releases/
---

{% for post in site.categories["release"] %}
  {% include release-note.html post=post content=post.content %}
{% endfor %}
