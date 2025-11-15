# OneMAC

<a href="https://enterprise-cmcs.github.io/macpro-mako/">
  <img alt="Docs" src="https://img.shields.io/badge/Docs-site-blue.svg">
</a>
<a href="https://qmacbis.atlassian.net/jira/software/c/projects/OY2/boards/257">
  <img alt="Jira" src="https://img.shields.io/badge/Jira-board-0052CC.svg">
</a>
<a href="https://cmsgov.slack.com/archives/C05ECGY0F5F">
  <img alt="Slack" src="https://img.shields.io/badge/Slack-channel-purple.svg">
</a>
<a href="https://snyk.io/">
  <img alt="Snyk" src="https://img.shields.io/badge/Snyk-protected-purple">
</a>
<br />
<a href="https://codeclimate.com/github/Enterprise-CMCS/macpro-mako/maintainability">
  <img src="https://api.codeclimate.com/v1/badges/f4480e77af640e6fa864/maintainability" />
</a>
<a href="https://codeclimate.com/github/Enterprise-CMCS/macpro-mako/test_coverage">
  <img src="https://api.codeclimate.com/v1/badges/f4480e77af640e6fa864/test_coverage" />
</a>
<a href="https://github.com/prettier/prettier">
  <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
</a>

## Overview

OneMAC is a comprehensive state government application that enables state employees to submit new Medicaid waivers, State Plan Amendments (SPAs), and amendments to existing programs. The application serves as a modernized replacement for the legacy OneMAC system, providing a streamlined interface for complex healthcare policy submissions while maintaining integration with existing CMS systems.

**Key Users:**

- **State Government Users**: Submit and manage Medicaid/CHIP packages
- **CMS Users**: Read-only access to review submissions and manage user roles

## Features

### Supported Submission Types

- **Medicaid SPA**: Standard Medicaid state plan amendments
- **CHIP SPA**: Children's Health Insurance Program amendments  
- **CHIP Eligibility SPA**: CHIP eligibility-specific amendments
- **1915(b) Waivers**: Comprehensive Capitated and Contracting waivers
- **1915(c) Appendix K**: Home and community-based services amendments
- **Temporary Extensions**: Short-term waiver extensions

### Core Capabilities

- **Package Management**: Submit, respond to RAI, withdraw packages, upload documents
- **User Management**: Role-based access control with state-specific permissions
- **Real-time Sync**: Integration with SEATool and legacy systems via Kafka
- **508 Compliance**: Full accessibility compliance with automated testing

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: AWS Lambda + Node.js + TypeScript  
- **Data**: OpenSearch + S3 + Kafka event streaming
- **Infrastructure**: AWS CDK + CloudFormation
- **Testing**: Vitest + Playwright + Storybook + axe-core

## Quick Start

### Prerequisites

- Node.js (version in `.nvmrc`)
- Bun package manager
- direnv for environment management
- AWS CLI configured

### Development Setup

```bash
# Setup environment (run once)
direnv allow

# Install dependencies
run install

# Start local development
run ui

# Run tests
run test

# Deploy to AWS
run deploy --stage <branch-name>
```

## Documentation

- **Complete Technical Documentation**: [TECH_OVERVIEW.MD](./TECH_OVERVIEW.MD) - Comprehensive system architecture and implementation details
- **Project Documentation Site**: [GitHub Pages](https://enterprise-cmcs.github.io/macpro-mako/)
- **Additional Resources**: [GitHub Wiki](https://github.com/Enterprise-CMCS/macpro-mako/wiki)

## Architecture Overview

OneMAC follows an event-driven architecture:

- **Frontend**: React SPA served via CloudFront at `onemac.cms.gov`
- **API Layer**: AWS API Gateway with Lambda functions
- **Data Processing**: Kafka event streams with multiple sink Lambda processors
- **Storage**: OpenSearch for search/indexing, S3 for file attachments
- **Integration**: SEATool integration via BigMAC Kafka topics for CMS workflows

## Contributing

### Project Management

- **Jira Board**: [Project Kanban](https://qmacbis.atlassian.net/jira/software/c/projects/OY2/boards/257)
- **Slack Channel**: [Team Communication](https://cmsgov.slack.com/archives/C05ECGY0F5F)

### Development Workflow

1. Create feature branch from `main`
2. Develop with automatic branch deployment to AWS
3. Submit pull request with automated testing
4. Merge triggers production deployment via semantic release

## Key External Resources

- **Medicaid Program Information**: [Medicaid.gov](https://www.medicaid.gov/)
- **CMS State Resource Center**: [Technical Assistance](https://www.medicaid.gov/state-resource-center/)
- **Accessibility Guidelines**: [Section 508](https://www.section508.gov/)

## License

[![License](https://img.shields.io/badge/License-CC0--1.0--Universal-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/legalcode)

See [LICENSE](LICENSE) for full details.
