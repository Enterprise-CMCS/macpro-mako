---
layout: default
title: ui-infra
parent: Services
nav_order: 5
---

# UI Infra
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

## Overview
This service provides the appropriate infrastructure for the UI application running on AWS. It creates several resources including an S3 bucket, a bucket policy, a logging bucket, a logging bucket policy, and an IAM role with permissions.


## Components

- AWS IAM role with permissions for CloudWatch logs and an IAM boundary policy.
- Serverless plugins to help with deploying and managing the infrastructure.
- Configuration settings for different stages of the infrastructure, including DNS record, CloudFront domain name, and certificates.
- A set of resources to be created, including S3 buckets for hosting the UI, logging, and their policies.

## Resources

- An S3 bucket with server-side encryption and the ability to serve static web content.
- A bucket policy that allows access to the bucket from an AWS CloudFront distribution using an Origin Access Identity (OAI).
- An S3 bucket for CloudFront access logs with server-side encryption and an access policy that allows AWS root account to write logs.
- A conditional statement for DNS record creation and a conditional statement for CloudFront distribution creation.
