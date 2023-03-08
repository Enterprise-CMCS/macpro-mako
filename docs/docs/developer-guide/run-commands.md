---
layout: default
title: Run Commands
parent: Developer Guide
nav_order: 10
---

# Running Top Level Commands
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

## Overview
The `src/run.ts` file defines many helpful commands you can use to perform helpful tasks for your project. This file utilizes Yargs to provide command line interfaces to several commands for managing a serverless project. 

This code at `src/run.ts` is implementing a command-line interface (CLI) for your project. The CLI accepts various commands to manage and deploy the project. The CLI tool uses the yargs library to parse the command-line arguments.

The CLI provides the following commands to use like `run [command] [options]`

## Commands

`install` installs all service dependencies.
`ui` configures and starts a local React UI against a remote backend.
`deploy` deploys the project.
`test` runs all available tests.
`test-gui` opens the unit-testing GUI for vitest.
`destroy` destroys a stage in AWS.
`connect` prints a connection string that can be run to 'ssh' directly onto the ECS Fargate task.
`deleteTopics` deletes topics from Bigmac which were created by development/ephemeral branches.
`syncSecurityHubFindings` syncs Security Hub findings to GitHub Issues.
`docs` starts the Jekyll documentation site in a Docker container, available on http://localhost:4000.

## Options 
Each command has its own set of options that can be passed in the command line.

For example, if the command deploy is used, it requires the options stage (type string, demanded option), and service (type string, not demanded option). The behavior of the command is defined by an async function, which will run the installation of all service dependencies and will execute the deployment process through the runner.run_command_and_output function with the command SLS Deploy and the options set in the command line.

The same approach is used for all other commands. They all start by installing the dependencies of the services, and then perform specific tasks based on the options passed in the command line.

The docs command starts a Jekyll documentation site in a Docker container. If the stop option is passed as true, it will stop any existing container. Otherwise, it will start a new container and run the documentation site at http://localhost:4000.
