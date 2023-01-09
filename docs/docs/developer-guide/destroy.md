---
layout: default
title: Destroy a Stage
parent: Developer Guide
nav_order: 3
---

# Destroy a Stage
{: .no_toc }

How-to destroy a stage in AWS.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

### Destroy using GitHub Actions - branch deletion

#### Summary
GitHub Actions is usually the best way to destroy a stage.  A Destroy workflow exists for this project, which will neatly take down any and all infrastructure related to a branch/stage, as well as deactivate the GitHub Environment, if it exists.

In most cases, stages are deployed from a branch in the git repo.  If this is the case, and if the branch can be safely deleted, destroying using GitHub Actions and branch deletion is the preferred approach.

#### Prerequisites
- Git repo write access; complete the Git access request portion of [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- Stop and think about what you are doing.  Destroying is a lot easier to avoid then to undo.
- Delete the branch for the stage you wish to delete.
  ```bash
    cd {{ site.repo.name }}
    git push --delete origin foo
  ```
- Monitor the status of your stage's destruction in the repo's [Actions area](https://github.com/{{ site.repo.org }}/{{ site.repo.name }}/actions).

#### Notes
- None

### Destroy using GitHub Actions - manual dispatch

#### Summary
The same GitHub Actions workflow referenced above can be triggered manually.  This is primarily useful if there is AWS infrastructure that still exists for a branch that has been deleted, and you don't want to go to the trouble of running destroy from your Mac.  Or, if you want to do a clean deploy of a stage, but you don't want to delete the branch, this can also be handy.

#### Prerequisites
- Git repo write access; complete the Git access request portion of [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- In a browser, go to the [repo](https://github.com/{{ site.repo.org }}/{{ site.repo.name }})
- Click the Actions tab
- Click Destroy, located on the left hand side of the screen.
- Click 'Run workflow'
  - Leave 'Use workflow from' set to master.
  - Enter the name of the stage you wish to destroy in the free text field.
  - Click 'Run workflow'
- Monitor the status of your stage's destruction in the repo's [Actions area](https://github.com/{{ site.repo.org }}/{{ site.repo.name }}/actions).

#### Notes
- None

### Destroy a stage

#### Summary
This destroys an entire application, so the entire stage, to AWS.

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- Stop and think about what you are doing.  Destroying is a lot easier to avoid then to undo.
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Destroy using the run script:
  ```bash
    cd {{ site.repo.name }}
    nvm use
    run destroy --stage foo
  ```

#### Notes
- After running the above destroy command, the script will output any Cloudformation stacks that will be deleted, and ask you to verify the stage name to proceed with destruction.  If you'd like to proceed, re-enter the stage name and hit enter.
- The destroy script will hold your terminal process open until all stacks report as DESTROY_COMPLETE in cloudformation.  If a stack fails to delete, or if there is a timeout, the script will fail.  You may retry the script again, but it may be worth investigating the failure.
- Please be mindful of what you are doing.

### Destroy an individual service

#### Summary

This will destroy a single service for a given stage.

#### Prerequisites:
- Completed all [onboarding]({{ site.baseurl }}{% link docs/onboarding/onboarding.md %})

#### Procedure
- Stop and think about what you are doing.  Destroying is a lot easier to avoid then to undo.
- [Obtain and set AWS CLI credentials]({{ site.baseurl }}{%link docs/developer-guide/aws-auth.md %})
- Destroy a single service using the run script:
  ```bash
    cd {{ site.repo.name }}
    nvm use
    run destroy --service bar --stage foo
  ```

#### Notes
- All notes from the Destroy a Stage section (above) hold true for destroying an individual service.
