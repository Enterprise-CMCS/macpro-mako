---
layout: default
title: ui
parent: Services
---

# UI
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

## Overview
This service deploys a static web application to an S3 bucket with a CloudFront distribution in front of it for CDN caching and performance optimization. The template uses the serverless framework and includes several plugins to help with deployment and configuration.

## Configuration

The custom section defines some custom variables, including the project name, stage, region, and CloudFormation termination protection for specific stages. The s3Sync section defines the S3 bucket to which the files will be synced, the local directory where the files will be found, and whether to delete removed files.

The cloudfrontInvalidate section invalidates the CloudFront distribution cache by specifying the distribution ID and the items to invalidate. The scripts section defines a script to set environment variables during deployment, which are used to specify the API region and URL.

The provider section configures the runtime environment for the Lambda functions, the AWS region, and stack tags. It does not include any IAM configuration since no Lambda functions are defined.

This template is mainly focused on deploying the static web application to S3 and configuring the CloudFront distribution to serve the content. The environment variables set in the scripts section are used by the application to connect to the backend API.

## Scripts
There are three npm scripts that are defined in the package.json file of a project. These scripts are used to automate certain development tasks related to the project.

1. `dev`: This script runs the Vite development server. Vite is a build tool that enables fast development by providing a development server that reloads the browser quickly whenever changes are made to the code. When the dev script is run, Vite starts the development server and serves the project files on a local web server. The output of this script will typically be a URL that can be opened in a web browser to access the development server.

1. `build`: This script builds the project for production. This script first runs the TypeScript compiler (tsc) to compile the TypeScript code to JavaScript. After that, the Vite build tool is run to bundle the code and assets for production. The output of this script will typically be a set of static files that can be deployed to a web server.

1. `preview`: This script starts a Vite server that serves the production build of the project on a local web server. This is useful for testing the production build locally before deploying it to a web server. When this script is run, Vite starts the production server and serves the project files on a local web server. The output of this script will typically be a URL that can be opened in a web browser to access the production server.