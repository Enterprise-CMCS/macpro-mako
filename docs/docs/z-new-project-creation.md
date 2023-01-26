---
layout: default
title: New Project Creation
nav_order: 99
---

# New Project Creation

Standard Operating Procedure for MACPRO Project Creation.

## Introduction
 On MACPRO, we get a lot of ideas. These stem both from the client and our development teams, both aimed at delivering on the project’s charter. These ideas often require a new project to be created. Project in this context refers to a github repository with its own distinct delivery repository and lifecycle. This document aims to be a guide for starting a new project, or a guide on how to take an idea and start delivering it.
## Audience
This SOP is suited for anyone involved with project creation. Parts will be non technical process oriented, and other parts will require technical knowledge and experience. CMS Jira requests will need to be made, so someone with appropriate access will need to be involved.
## Summary

1. Request a new GitHub repository for the project
1. Request a new set of AWS accounts (if applicable).
1. Create a new Slack channel for the project.
1. Bootstrap the new project with the base template.

## Details

### Step 1: Request a new GitHub repository for the project.
Creating a new project will always involve creating a new GitHub repository, so this step must always be completed. Before making the request for the new repo, you need to decide a few things:
- Should the repo be public or private? CMS, as a rule, likes to open source its projects, and keep some projects private by exception. So, if the project you’re creating is allowed to be public from a security stance, it should probably be public. If there’s any reason it should not be public, it should be private. The answer to this question is not always straightforward. Sometimes we have a project that doesn’t contain any secret or sensitive information, but it sheds light on the deployed, operational architecture of systems that do have such information. In that case we may decide to keep the project private. The public or private decision should be considered carefully.
- Should GitHub Actions be enabled? The answer is almost certainly yes. New MACPRO projects use GitHub Actions as it’s CI/CD appliance. In the future, Actions may be substituted for a different tool, but for now Actions is required. This question is mainly being listed since the request for Actions to be enabled on the repo is done as a distinct task.
- Who should be the initial repository admin? The repo creation process requires adding at least one MACPRO user as a repository administrator. This administrator can then add the appropriate team members to the repo.
- What should the project be called? This may already have an answer, one that you decided before referencing this document. But consider the repo name anyways. Keep in mind:
- Newly created projects will be created within the {{ site.repo.org }} GitHub organization, so it usually doesn’t make sense to include ‘cms’ in the repository name.
- All lowercase letters is a standard
- The name of the project/repo will be used a lot. It should be accurate, but
sometimes less is more.

Once you've considered the above points, [follow this how-to guide](https://qmacbis.atlassian.net/l/cp/QDuKKWGH) to create a new Git repo.


### Step 2: Request a new set of AWS accounts, if applicable
The ‘if applicable part’ is important. 

You’ll need to decide if this new project requires its own set of AWS accounts. For background, CMS creates AWS accounts in sets of three: a ‘dev’ account, an ‘impl’ account, and a ‘prod’ account. These are created when requested by MACPRO to support new products.
However, not all new projects require its own set of accounts. While a new service or idea may be best organized in its own repository, it's sometimes unnecessary to organize it in its own AWS accounts. For example: there exists a set of ‘Bigmac’ accounts (bigmac-dev, bigmac-val, bigmac-prod). Within this set of accounts, however, several projects (repositories) are deployed. The cms-bigmac project, mmdl-connectors, seatool-connectors, and seatool-compare are each an individual project and repository, but leverage the same set of accounts. This was done because from a security standpoint, there’s no harm in them coexisting. And from a business management perspective, having less AWS Accounts when it’s acceptably secure is preferred.
In general, answer this: can my new project leverage an existing set of AWS Accounts without compromising security? Keep in mind, our developer access is organized at the account level. So for instance, anyone who gets access to Project B also gets access to Project A if B and A are deployed to the same set of AWS Accounts.
If you do have a set of AWS Accounts you can use, great! Move along to step 3. If you need to create new AWS Accounts, [follow this procedure](https://cloud.cms.gov/aws-account-creation) published by CMS.

### Step 3: Create a new Slack channel for the project.
Slack is used on MACPRO as a primary means of communication. While Slack is neither a "System of Record" nor approved for sensitive information or inappropriate use, it nonetheless is crucial to MACPRO development.
While there are many Slack channels for various purposes, we typically create one dedicated slack channel per project or repository. This channel is typically subscribed to GitHub repository events, such as releases, and is where developers can send messages regarding the product. As such, creating a new Slack channel is part of the project creation SOP

Someone with appropriate permissions can follow this procedure to create a new Slack Channel:
1. Login to the CMS Slack workspace (cmsgov.slack.com)
1. Next to ‘Channels, click the ‘+’ sign.
1. Create a new channel.
    1. Set the visibility (public/private) accordingly.  There's no rule here, but a public repo's channel should likely be public, and a private repo's channel should likely be private.
    1. Name it the same as the project repository.
1. Once created, make a note of the new channel’s URL
    1. Find the channel on the sidebar
    1. Right click -> Copy -> Copy Link. You may put this link somewhere like a notepad as you will use it later. But don’t worry, this can always be found again.
1. You may add anyone who should have access to the channel.

### Step 4: Bootstrap the new repository.
New MACPRO project repositories are bootstrapped with code from our base template repository. This base template repository is a github repo itself; it’s maintained by the MACPRO Platform Team as the standard MACPRO project structure. It includes patterns for deployment, deployment of dev branches, testing, security scanning, and so forth. There’s a lot of functionality packed into it, without commenting much on the actual application architecture. This is done deliberately, so projects may use the template as a starting point, and build the new project’s services on top of it. In the future, there may be other templates that are more specific, such as a webapp template or a kafka consumer template, but for now there is only the single base template. This step involved getting the latest copy of that template and pushing it to the new project repository.

For the purposes of these instructions, we will assume your new repository (created in the steps above) is called acme, and is in the Enterprise-CMCS organization.  We will also assume the template repository you will bootstrap your project with is called macpro-base-template, in the same org.
1. Ensure all GitHub Actions are enabled for your new repository.
    - Go to the repo in GitHub in a browser.
    - Click Settings
    - Click Actions (left hand side) -> General
    - Select 'Allow all actions and reusable workflows', if not already selected.  If this option is not already set and not selectable, you will need to open a ticket with the CMS Cloud team.
1. Ensure 'master' is set as the default branch for the new repository.
    - Go to the repo in GitHub in a web browser.
    - Click Settings
    - Click Branches (left hand side)
    - Set master as the default, if not already set.
1. Enable GitHub Pages to run on the master branch.
    - Go to the repo in GitHub in a web browser.
    - Click Settings
    - Click Pages (left hand side)
    - Under the Source dropdown, select GitHub Actions
1. Configure Dependabot
    - Go to the repo in GitHub in a web browser.
    - Click Settings
    - Click Code security and analysis
    - Enable Dependency Graph
    - Enable Dependabot alerts
    - Disable Dependabot security updates
    - Disable version updates
1. Clone your new repository.  
    ```
    git clone git@github.com:Enterprise-CMCS/acme.git
    ```
1. Create val and production branches off of master.
    ```
    cd acme
    git push origin val
    git push origin production
    ```
1. Push macpro-base-template's production branch to your new repository's master branch.
    ```
    cd acme
    git remote add base git@github.com:Enterprise-CMCS/macpro-base-template.git
    git fetch base
    git push origin base/production:master
    ```
1. Fetch your (newly built) GitHub Pages site's url.
    - Wait for the 'GitHub Pages' workflow, which triggered when you pushed, to finish.
    - Go to the repo in GitHub in a web browser.
    - Click Settings
    - Click Pages
    - You should see text that says "You site is live at https://xxxxxx".  Copy this url to a notepad; you'll need it in a later step.
1. Add and configure the repository in Code Climate.
    - Go to [https://codeclimate.com/](https://codeclimate.com/)
    - Click Login -> Quality (top right).
    - On the 'Pick an Organization' page, select the organization to which your new repository belongs.  However, if your repository is public, select Open Source.
    - Click Add a Repository
    - Find your repo and click Add Repo.
    - You should be taken to the landing page for your repo in Code Climate.  Sometimes adding a repo gets your browser stuck.  If that happens, just start back at [https://codeclimate.com/](https://codeclimate.com/) and find the repository again.  This time, though, you won't need to add it.
    - Click Repo Settings
    - Ensure the default branch is set to 'master' and click save.
    - Go back to Repo Settings
    - Click GitHub
    - Enable all features, including installing the webhook, and save all.
    - Go back to Repo Settings
    - Click Badges
    - Copy the HTML version of the Maintainability tag.  Keep this in a notepad for use later in these instructions.
1. Update project specific values in your codebase.
    - Open your cloned copy of the acme project in an editor.
    - Open and edit acme/.envrc
        - Update the value for PROJECT.
            - This value is used extensively in deployment, as it drives project namespacing.  It is what enables us to run many products in one AWS account ,if need be.
            - This value is typically related to your project name.  However, it does not need to match exactly, or really at all.  
            - To that point, a shorter name is preferred, as it will be put in many resource names.  For instance:  this repository, macpro-base-template, has a PROJECT value of just 'base'.  That's enough to be indicative of what project owns a resource with that tag, but not so long to be askward.
            - Once you've chosen a new project name during project creation, changing it can be extremely difficult.  So take a minute and make sure it's what you want.
    - Open and edit src/services/.oidc
        - Find the line that reads `SubjectClaimFilters: "repo:Enterprise-CMCS/macpro-base-template:*"` 
        - Update that line to reflect your new project org and repo:  `SubjectClaimFilters: "repo:Enterprise-CMCS/acme:*"`
    - Open and edit acme/README.md
        - Find all `https://enterprise-cmcs.github.io/macpro-base-template/` and replace all with the url to your GitHub Pages docs site.
        - Find all `https://cmsgov.slack.com/archives/C04D6HXJ3GA` and replace all with the url to your project Slack channel.
        - Find the block:
            ```
            <a href="https://codeclimate.com/github/Enterprise-CMCS/macpro-base-template/maintainability">
                <img src="https://api.codeclimate.com/v1/badges/f7cce65e43346ac8e2c2/maintainability" />
            </a>
            ``` and replace with the CodeClimate badge block you copied from CodeClimate in a previous step.
        - Update the text in the Overview and Contributing sections, as appropriate.
    - Open and edit the project's top level package.json file to be accurate.  Updates should include name, description, repository.url, and homepage.
    - Open and edit the Jekyll config file, docs/_config.yml.  Rather than list each place where a value might need replacing/updating, we recommend you walk through this file in detail.  It's a config file, so most of it's information will need updating.
    - Update the docs site overview information, located at docs/docs/overview.md - subsection Overview.  we recommend reusing the overview you put in the README
1. Deploy the OIDC service, and stage the created oidc role information in GitHub Secrets.
    - This requires a fully configured workstation and a developer to run commands.  Be sure the workstation has successfully run through the workspace setup procedure.
    - For the 'dev' AWS environment:
         - Get AWS access keys from Kion, and export them to a terminal.
         - `cd acme/src/services/.oidc`
         - `CI=true sls deploy --stage master`
         - Upon the above deploy command's completion, a ServiceRoleARN value should be output to the terminal; it should be near the bottom of all output.  Copy this value to a clipboard or notepad.
         - Go to your repository in a browser.
         - Navigate:  Settings -> Secrets and variables -> Actions -> New repository secret
         - Set a secret named AWS_OIDC_ROLE_TO_ASSUME, and set it's value to the ServiceRoleARN value you copied from the above step.  Click add secret.
         - This secret will be used by any branch that otherwise doesn't have a higher order secret (val and production will, in this next steps).
    - For the 'impl' (or maybe called 'val') AWS environment:  (NOTE:  Please read carefully, as the exact commands and github console steps are different than dev above.)
         - Get AWS access keys from Kion, and export them to a terminal.
         - `cd acme/src/services/.oidc`
         - `CI=true sls deploy --stage val`
         - Upon the above deploy command's completion, a ServiceRoleARN value should be output to the terminal; it should be near the bottom of all output.  Copy this value to a clipboard or notepad.
         - Go to your repository in a browser.
        - Navigate:  Settings -> Environments -> New environment
        - Create a new environment named val.
        - Add a new secret under 'Environment secrets'.  It's name should be AWS_OIDC_ROLE_TO_ASSUME and it's value should should be the ServiceRoleARN value you copied from the above step.
        - This is a great time to set environment protection rules and required reviewers, but we will skip detaili on that at this stage, as that's optional.
    - For the 'production' (or maybe called 'prod') AWS environment:  (NOTE:  Please read carefully, as the exact commands and github console steps are different than dev and impl above.)
         - Get AWS access keys from Kion, and export them to a terminal.
         - `cd acme/src/services/.oidc`
         - `CI=true sls deploy --stage production`
         - Upon the above deploy command's completion, a ServiceRoleARN value should be output to the terminal; it should be near the bottom of all output.  Copy this value to a clipboard or notepad.
         - Go to your repository in a browser.
        - Navigate:  Settings -> Environments -> New environment
        - Create a new environment named production.
        - Add a new secret under 'Environment secrets'.  It's name should be AWS_OIDC_ROLE_TO_ASSUME and it's value should should be the ServiceRoleARN value you copied from the above step.
        - This is a great time to set environment protection rules and required reviewers, but we will skip detaili on that at this stage, as that's optional.
1. (optional) Add a SLACK_WEBHOOK GitHub Secret.
    - Go to your repository in a browser.
    - Navigate:  Settings -> Secrets and variables -> Actions -> New repository secret
    - Set a secret named SLACK_WEBHOOK, and paste the value you have.
1. Commit and push all changes to your repository, and monitor GitHub Actions for success/failure.

### Conclusion
If you’ve followed this document, you should have a new GitHub project deployed to AWS and ready for further development. This document is a WIP, and assuredly has errors and omissions, and will change over time. You can help this by reaching out to the MACPRO Platform team on Slack and letting us know about issues you find.
