layout: default
title: End-to-end Testing
parent: Developer Guide
nav_order: 11

# e2e testing using Playwright
{: .no_toc }

## Table of Contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

## What is Playwright
The Playwright testing framework provides a powerful set of tools and APIs for automating and testing web applications. This guide will introduce you to the basics of using the Playwright framework and its core concepts.

The Playwright framework allows you to write tests that simulate user interactions with web pages, such as clicking buttons, filling forms, and validating page content. It supports multiple web browsers, including Chromium, Firefox, and WebKit, enabling cross-browser testing.

## How do I run tests
As a developer you run e2e tests against a local running instance of the application. By using the `run ui --stage [stage]` command to deploy and init an instance of the application. A second terminal can be used to run the `run e2e` command which will run the playwright tests against the currently running instance of the ui on localhost:5000.

## How do I write tests
The e2e tests for the UI service are located in `src/services/ui/e2e` and defined in .spec files. Use the examples found to guide how to structure your tests.

When defining the selectors for elements make sure to define your selectors in the `e2e/selectors` directory. Defining selectors using react component names and properties is prefered to maintain consistent scalable testing. Other patterns can be used such as xpath, element type/name, and id/data-id/test-id. But should only be used when necessary. 

## Running in the pipeline
An action has been added to the deploy github actions workflow that runs the e2e tests after the application deployment against the deployed frontend url. Note: This action will run in all environments except production. 

## Additional Notes:

Playwright is very powerful but should be used only to test general purpose user journeys. A test should NOT be create to test every ticket or story. Please review the documentation for additional functionality: [Playwright Docs](https://playwright.dev/docs/intro)