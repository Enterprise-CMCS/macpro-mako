---
layout: default
title: Overview
nav_order: 2
---

# Overview
{: .no_toc }

The 10,000ft view
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The {{ site.repo.name }} project is a serverless monorepo template.  The actual application is 'hello world', but the repository support and configuration is full featured. This is by design, to allow for simpler project creation from the template.  Full CI/CD support with GitHub Actions, automated security scanning, documentation with GH Pages, infrastructure and application deployment workflows, etc. is all included.  There are a few services that apply to almost any project in Amazon, and those are included.

## Architecture

A diagram is often the best way to communicate the architecture:

![diagram](../assets/diagram.svg)


## Development Metrics (DORA)

We programmatically publish a set of Development metrics that align to the DevOps Research and Assesment (DORA) standards.  Those metrics can be viewed [here]({{ site.url }}{{ site.repo.name }}/metrics/dora).

## AWS Resources

You can view and download a list of all aws resources this project uses for higher environments [here]({{ site.url }}{{ site.repo.name }}/metrics/aws).