# Repository Guidelines

## Project Structure & Module Organization

- Root configs (`package.json`, `turbo.json`, `bunfig.toml`) coordinate shared tooling for the Bun monorepo.
- `lib/` contains reusable TypeScript packages, AWS CDK stacks, and Lambda code with co-located `__tests__` folders.
- `react-app/` hosts the Vite UI, Storybook stories, and UI tests; static assets stay under `react-app/src/assets`.
- `bin/cli/` publishes the `mako` CLI, while `mocks/` and `test/` expose MSW handlers and Playwright helpers shared across suites.

## Branching Strategy

- Name feature branches with stage-safe tokens (letters, numbers, hyphens) so `./run ui` can derive a valid stage; e.g., use `JIRAID-stage-sync` instead of `feature/JIRAID-stage-sync`.
- Avoid characters that break CDK/SSM paths (slashes, spaces, uppercase); they prevent `.env.local` from being generated and block deploys.
- When you must use an existing stage (like `main`), pass it explicitly: `./run ui --stage main`.

## Infrastructure (CDK)

- `lib/stacks/parent.ts` orchestrates the deployment: it wires networking, alerts, uploads, data, api, auth, email, and UI infra nested stacks and publishes outputs to SSM for other services.
- `lib/stacks/data.ts` provisions OpenSearch (or consumes the shared domain), Kafka consumers, and Cognito resources; it uses the shared bundling config in `lib/config/bundling-config.ts`.
- `lib/stacks/api.ts` builds API Gateway, Lambda execution roles, log groups, and Node.js handlers with VPC access, secrets, and attachments bucket permissions.
- Shared deployment knobs live in `lib/config/deployment-config.ts`; the `./run deploy --stage <stage>` wrapper synthesizes these stacks via Bun before CDK deploy.
- Run `bun run build` ahead of CDK commands to ensure Lambda bundles (and `bun.lockb`) are up to date.
- Amplify is **not** provisioned in CDK; the React app only imports the Amplify JS client to talk to the Cognito user pool and API Gateway described above.

## Backend Lambdas

- `lib/lambda/index.ts` exports all handlers so the stacks can bundle them; domains are grouped under subfolders like `submit/`, `update/`, and `user-management/`.
- Core read/search handlers (`search.ts`, `getForm.ts`, `getAllForms.ts`) rely on shared utilities in `lib/lambda/libs/**` and OpenSearch helpers from `libs/opensearch-lib`.
- Submission flows (`lib/lambda/submit/*`) generate payloads, handle missing attachments, and publish Kafka events; update flows live under `lib/lambda/update/*`.
- Kafka sink processors (`sinkMain.ts`, `sinkChangelog.ts`, etc.) and maintenance jobs (`runReindex.ts`, `setupIndex.ts`) share middleware in `lib/lambda/middleware/` for auth, permissions, and normalization.
- Unit tests for each handler sit beside the source (e.g., `getAttachmentUrl.test.ts`); run `./run test --run lib/lambda` or `bun run build && bun run lint` before deploying backend changes.

## Build, Test, and Development Commands

Prefer the root `./run` wrapper for day-to-day tasks. It validates `direnv`, Node (from `.nvmrc`), and Bun before compiling the CLI in `bin/cli` and dispatching the requested command.

### Environment setup

- `direnv allow .` — load shared environment variables for the workspace.
- `./run install` — install dependencies across packages with Bun.
- `bun run build` — compile TypeScript across workspaces before packaging Lambdas or synthesizing CDK.

### UI workflows

- `./run ui --mocked` — run the React app against MSW handlers (starts Vite on port 5173).
- `./run ui [--stage <stage>]` — run the React app against the specified deployed API; defaults to the branch-derived stage and writes the correct `.env.local` for Amplify/Vite.
- `./run storybook [--ci|--build-only]` — build Storybook assets and optionally launch the dev server (installs Playwright Chromium first).
- `./run emails` — launch the transactional email preview server (requires AWS credentials unless mocked data is used downstream).

### Testing

- `./run test` — execute Vitest suites; add `--coverage`, `--ui`, or `--storybook` for alternate modes. Use `--run` to disable watch mode. Support file filtering: `./run test --run getReportUrl` or `./run test --run lib/lambda/specific.test.ts` (storybook mode prebuilds the UI and installs Playwright binaries).
- `AGENT_MODE=mocked ./run e2e [--ui]` — run Playwright E2E specs; the CLI installs browser deps before invoking the proper Bun script.
- `bun run lint` / `bun run format:check` — enforce ESLint and Prettier; prefer `bun run format:write` when you need to apply fixes.

### Documentation and support tooling

- `./run docs` — start the Jekyll documentation container on http://localhost:4000; append `--stop` to tear it down.
- `./run open-app` / `./run open-kibana` — open the stage-specific application or Kibana URLs retrieved from SSM (requires MACPro AWS credentials).
- `./run logs --functionName <name> [--stage <stage>]` — tail CloudWatch logs for a tagged Lambda; interactive when multiple functions match.
- `./run get-cost [--stage <stage>]` — print the last 14 days of AWS costs for the tagged stack.

### AWS orchestration

- `./run deploy --stage <stage>` — deploy CDK infrastructure and publish the built React app to S3/CloudFront.
- `./run destroy --stage <stage> [--no-wait|--no-secgroup|--no-verify]` — tear down non-production stacks; waits for completion and cleans the security group by default.
- `./run watch [--stage <stage>]` — run `cdk watch` with stage-aware environment provisioning.

## Coding Style & Naming Conventions

- Keep types strict, prefer interfaces for exported contracts, and avoid default exports in shared packages.
- Prettier defaults (two-space indent, semicolons) and ESLint rules in `eslint.config.mjs` are the source of truth.
- Follow `camelCase` for variables, `PascalCase` for components, and `SCREAMING_SNAKE_CASE` for environment variables.

## Testing Guidelines

- Place unit tests as `*.test.ts(x)` beside source; rely on MSW fixtures in `mocks/` to isolate network calls.
- Use `./run test --storybook` for visual and axe coverage; update snapshots only after confirming UI changes.
- Playwright specs live in `test/e2e`; capture failing artifacts from `playwright-report/` when filing issues.

## Commit & Pull Request Guidelines

- Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) to keep semantic-release automation intact.
- Before pushing, run `bun run lint` and `./run test`; include `cdk diff` summaries when infrastructure changes.
- Pull requests should describe context, solution, linked Jira/GitHub work, and testing evidence (logs or screenshots).

## Security & Configuration Tips

- Store secrets outside the repo; export `AGENT_MODE`, `STAGE_NAME`, and AWS credentials through your shell profile.
- Validate infrastructure with `bun run cdk synth` prior to review and ensure IAM boundaries remain intact.
