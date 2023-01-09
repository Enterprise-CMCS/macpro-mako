---
layout: default
title: Workspace Setup
parent: Onboarding
nav_order: 4
---

# Workspace Setup
{: .no_toc }

Before you begin development, it's important to configure your workstation properly. This section will give you an overview of what tools are installed and get you bootstrapped.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
---

## Development Tool list
This is a static list of tools that should be pre-installed to support all Developer Guide. Please understand that the installation of most of these tools is automated, which will be discussed in the next section.  This serves as a general overview of what will be installed.

| Tool                                                                              | Version   | Required |
| --------------------------------------------------------------------------------- | --------- | -------- |
| [MacOS](https://www.apple.com/macos/monterey/)                                    | 10.15+    | Yes      |
| [Rosetta 2 (Apple Silicon only)](https://support.apple.com/en-us/HT211861)        | 2         | Yes      |
| [XCode Command Line Tools](https://mac.install.guide/commandlinetools/index.html) | 2392      | Yes      |
| [NodeJS](https://nodejs.org/en/)                                                  | 14.x      | Yes      |
| [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm)                       | 0.39.1    | Yes      |
| [Yarn](https://yarnpkg.com/)                                                      | 1.22.18   | Yes      |
| [Direnv](https://direnv/)                                                         | 2.31.0    | Yes      |
| [AWS CLI ](https://aws.amazon.com/cli/)                                           | 2.x       | Yes      |
| [AWS CLI Sessions Manager Plugin][ssmpluginlink]                                  | 1.2.312.0 | Yes      |
| [jq](https://stedolan.github.io/jq/)                                              | jq-1.6    | Yes      |
| [awslogs](https://github.com/jorgebastida/awslogs)                                | 1.2.312.0 | Optional |
| [Git](https://git-scm.com/)                                                       | 2.x       | Yes      |

[ssmpluginlink]: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html


## Install Rosetta 2 (Apple Silicon only)

If you're on a newer model Mac with an Apple ARM based chip (M1 series), you need to install Rosetta 2.

Follow this [Apple Support guide](https://support.apple.com/en-us/HT211861) to install Rosetta 2.

## Install XCode Command Line Tools

Follow the [installation guide](https://mac.install.guide/commandlinetools/index.html).

## Run the setup.sh script

Once you reach this step, the remainder of the tools you'll need can be installed with a simple script.

- Download and save the [setup.sh script](../../../assets/setup.sh) somewhere accessible on your computer. Your Downloads folder, which is probably your default download location, is fine.
- Open a terminal
- Run the setup.sh script
  ```
  sh ~/Downloads/setup.sh
  ```
  Please note that you may be prompted to input your OS user's password, as some installation steps require higher priveleges.

After successfully running the setup script, close all open terminals. The script adds PATH modifications to your .zshrc file, and that file will only take affect when starting a new terminal session. To ensure you immediately have the PATH modifications available, it's easiest to simply close all terminal windows now. You may reopen the terminal at any time afterwards.

## Clone the repository

Now that you have all prerequisites installed, it's time to get the code base. This will require your git repo access request to have been completed.

- Configure your GitHub user with an SSH key, and add it to your ssh-agent. [Help can be found here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent). Using https and personal access tokens, instead of SSH and a key, is possible but discouraged.
- Clone the repository
  ```
  git clone git@github.com:{{ site.repo.org }}/{{ site.repo.name }}.git
  ```

## Configure AWS CLI

This step requires that your request for AWS access has been completed. If it hasn't, you'll need to wait, then return here.

- Login to the AWS Console.
- Create an AWS Access Key Id and Secret Access Key for your IAM user. Detailed instructions are [available](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).
- Configure the AWS CLI with valid credentials. Background and instructions can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). Running `aws configure` and following the prompts should suffice, though.

## Now what?

Nice job! If you've successfully stepped through this document, you should be entirely ready to start active development on the {{ site.repo.name }} project.

If you've had errors along the way, that's OK! We're here to help. If you've successfully joined our Slack channel, feel free to post there.  Else, please send an email to mdial@collabralink.com explaining the issue. We will get back to you ASAP.
