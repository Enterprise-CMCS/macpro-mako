---
layout: default
title: Pre-Commit Usage
parent: Developer Guide
nav_order: 8
---

# Pre-Commit Usage
{: .no_toc }

How to use pre-commit on the project

{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Context

[Pre-commit](https://pre-commit.com/) is a python package that enables projects to specifies a list of hooks to run before a commit is made (a pre-commit hook).  This is really useful to enforce standards or conventions, as it prevents non conformant changes from getting committed.  

On this project, we use pre-commit to automate several checks, including:
- running a code formatting check based on [prettier](https://prettier.io/)
- checking for large files typically not desired to keep in source control
- scanning for secret material, such as AWS keys

Aside from these checks being run prior to any commit being pushed, they are also run by a GitHub Actions workflow when a pull request is made.

### Installation

Good news!  If you completed onboarding and ran the [workspace setup]({{ site.baseurl }}{% link docs/onboarding/workspace-setup.md %}) script, pre-commit should already be installed on your machine.

You can test that it's installed by running `pre-commit -V` in a terminal window.  If you get a nominal return including a version number, you're all set.  If the pre-commit command is not found, please refer back to the Onboarding / Workspace Setup section of this site.
If pre-commit is not installed it is important to get it installed and setup on your machine. This is a part of the workflow for developing apps in this architecture. Luckily setup is simple.

### Configuration

Although pre-commit is installed on your workstation, you must configure pre-commit to run for a given repository before it will begin blocking bad commits.

This procedure needs to only be run once per repository, or once each time the .pre-commit-config.yaml file is changed in the repository (very infrequently).

- open a terminal
- install all hooks configured in .pre-commit-config.yaml
  ```bash
    cd {{ site.repo.name }}
    pre-commit install -a
  ```

That's it -- after running the above commands inside the project repository, pre-comit will run the project's configured checks before any commit.