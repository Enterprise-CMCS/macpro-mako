---
layout: page
title: Release Notes
permalink: releases/
---

{% assign releases = site.categories["release"] | sort: 'published_at' | reverse %}
{% for post in releases %}
  {% include release-note.html post=post content=post.content %}
{% endfor %}
