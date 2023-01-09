---
layout: default
title: Pre-commit
parent: Developer Guide
nav_order: 8
---

# What is Pre-Commit?
{: .no_toc }

Pre-commit is two things in the context of our project. It is a git hook that taps into the lifecycle of commits and fires before a commit is made. It is also a python package that enables the development and versioning of these git hooks much easier.

We use pre-commit for a variety of things consisting of, but not limited to running formatting checks against code and ensuring that secrets and keys are not checked into the codebase.

{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Installation
If pre-commit is not installed it is important to get it installed and setup on your machine. This is a part of the workflow for developing apps in this architecture. Luckily setup is simple.

The first step is two ensure that "Homebrew" is installed.

[Homebrew](https://brew.sh/)

Once homebrew is setup and installed on your machine, run the following command to install pre-commit.

```
brew install pre-commit
```

This is pretty much it. You can test that pre-commit is installed by running this command in the repository root.

```
pre-commit
```