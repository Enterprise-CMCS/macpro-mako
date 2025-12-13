# GitHub Copilot Repository Instructions

## Read First

- Scan `AGENTS.md` for project-wide standards before suggesting code or configs.
- Follow the conventions there unless explicit inline files override them.

## Coding Conventions

- TypeScript/TSX dominates; default to strict typing, interfaces for exports, and avoid default exports in shared code.
- Honor Prettier formatting (two-space indent, semicolons) and ESLint rules; prefer existing utility patterns over ad-hoc helpers.
- Surface purposeful comments only when clarifying non-obvious logic; do not add noise.
- When touching React, assume Vite + React Query + LaunchDarkly stack; reuse hooks and components under `react-app/src`.

## Infrastructure Assumptions

- Backend infrastructure is defined with AWS CDK under `lib/stacks`; Lambda handlers live in `lib/lambda`.
- Amplify is not provisioned via CDK—the React app imports the Amplify JS client purely for Cognito/API access. Do not scaffold Amplify backends.

## Tooling & Commands

- Use Bun scripts (`bun run build`, `bun run lint`) and the `./run` CLI wrapper for installs, tests, and UI work. For targeted testing, use `./run test --run <filter>` to run specific test files.
- Use `./run --help` additional flags for specific subcommands.
- Prefer Vitest for unit tests; place `*.test.ts` files beside sources.

## Branching & Environments

- Stage names are derived from branch names; suggest branch slugs using letters, numbers, and hyphens only (e.g., `JIRA_ID-feature-name`).
- If code must target a shared stage like `main`, call it out explicitly rather than relying on auto-derivation.

## When Unsure

- Reference existing patterns in `lib/` or `react-app/` before proposing new frameworks or dependencies.
- **DO NOT HALLUCINATE:** If repository guidance conflicts, defer to human review and note the ambiguity.
