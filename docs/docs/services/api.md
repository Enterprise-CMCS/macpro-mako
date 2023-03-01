---
layout: default
title: api
parent: Services
nav_order: 6
---

# API
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

## Overview
This stack is used to deploy a RESTful API service to AWS. The service includes a set of functions that can be used to interact with the API, and it is secured with various AWS security policies.

## Service
The service name is ${self:custom.project}-api, where ${self:custom.project} is a parameter provided by the user. This ensures that the service name is unique to the user's project.

## Package
The package section is used to configure how the deployment package for the service is generated. The "individually: true" setting is used to generate separate packages for each function in the service. This makes it easier to deploy and update individual functions without having to deploy the entire service.

## Plugins
The plugins section is used to specify the plugins that will be used during the deployment of the service. The following plugins are used:

serverless-bundle: A plugin that optimizes the packaging and deployment process for serverless applications.
serverless-stack-termination-protection: A plugin that applies CloudFormation termination protection to the specified stages, ensuring that accidental deletions of the service do not occur.
"@stratiformdigital/serverless-iam-helper": A plugin that simplifies the creation and management of AWS IAM roles and policies.
"@stratiformdigital/serverless-s3-security-helper": A plugin that adds security best practices to S3 buckets.

## Provider
The provider section is used to configure the cloud provider (AWS), and any additional settings for the provider. The following settings are used:

- name: aws
-runtime: nodejs18.x
region: ${env:REGION_A} (This setting retrieves the region value from an environment variable called "REGION_A").
stackTags: Specifies tags to be applied to the CloudFormation stack. The tags include PROJECT and SERVICE, which are set to the custom.project and service values, respectively.
iam: Specifies IAM related settings for the CloudFormation stack. The role setting specifies the path and permissions boundary for the IAM role. The statements setting specifies the permissions granted to the role. In this case, the role is granted permission to access all CloudWatch resources.
Custom:
The custom section is used to specify custom settings for the service. The following settings are used:

project: ${env:PROJECT} (This setting retrieves the project value from an environment variable called "PROJECT").
accountId: !Sub "${AWS::AccountId}" (This setting retrieves the account ID for the AWS account in which the stack is deployed).
stage: ${opt:stage, self:provider.stage} (This setting specifies the deployment stage for the service. It is retrieved from an option called "stage", and if the option is not set, it defaults to the value specified in provider.stage).
serverlessTerminationProtection: Specifies the stages to which CloudFormation termination protection will be applied.

## Endpoints
The service is defining an API with five endpoints: getPosts, getPost, createPost, deletePost, and updatePost, which will handle GET, POST, PUT and DELETE requests for /posts and /posts/{id} paths.

## Resources
The resources section is used to specify the additional AWS resources that the service requires. In this case, two gateway responses are created for 4xx and 5xx responses.

## Outputs
The output values include the name and URL of the API Gateway, as well as the AWS region in which the stack is deployed.

