---
layout: default
title: Run Docs Site Locally
parent: Developer Guide
nav_order: 4
---

# Run Jekyll Docs Site Locally
{: .no_toc }

How-to run our GitHub Pages Jekyll docs site (the site you're viewing) locally.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Start the docs site locally

#### Summary
This procedure will walk you through starting up the docs site locally.  You may want to run the docs site locally if you are modifying the documentation, allowing you to preview before committing.  

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})
- You will need a docker runtime up and running.  This can be Docker Desktop (if licensed), or an open source tool like Colima.  Generally, if you can run the command `docker ps` and not get an error, you have a docker runtime up and running.

#### Procedure
- Start the docs site using the run script:
  ```bash
    cd {{ site.repo.name }}
    run docs
  ```
- In a browser, visit [http://localhost:4000](http://localhost:4000) to view the running site.
- As you make changes to the files under the repo's docs folder, you should see the changes reflected in your browser in less than a second.

#### Notes
