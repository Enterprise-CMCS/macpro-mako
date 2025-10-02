# Repository Guidelines

## Project Structure & Module Organization

- Root configs (`package.json`, `turbo.json`, `bunfig.toml`) coordinate shared tooling for the Bun monorepo.
- `lib/` contains reusable TypeScript packages, AWS CDK stacks, and Lambda code with co-located `__tests__` folders.
- `react-app/` hosts the Vite UI, Storybook stories, and UI tests; static assets stay under `react-app/src/assets`.
- `bin/cli/` publishes the `mako` CLI, while `mocks/` and `test/` expose MSW handlers and Playwright helpers shared across suites.

## Build, Test, and Development Commands

- `direnv allow` - to allow direnv to load the environment variables.
- `bun run bun:dev` — start the React app with the agent-aware proxy on port 5173.
- `bun run build` — compile TypeScript across workspaces; run before packaging Lambdas or synthesizing CDK.
- `bun run lint` / `bun run format:check` — enforce ESLint and Prettier; prefer `format:write` for fixes.
- `bun run test` (`test:coverage`) — execute Vitest projects for `lib`, `email`, and `ui`; coverage threshold is 80% per `bunfig.toml`.
- `bun run e2e` / `bun run e2e:ui` — trigger Playwright suites in `test/e2e`; pass `AGENT_MODE=mocked` for deterministic local runs.
- `bun run cdk:watch` — iterate on CDK stacks, defaulting `STAGE` to `local`.

## Coding Style & Naming Conventions

- Keep types strict, prefer interfaces for exported contracts, and avoid default exports in shared packages.
- Prettier defaults (two-space indent, semicolons) and ESLint rules in `eslint.config.mjs` are the source of truth.
- Follow `camelCase` for variables, `PascalCase` for components, and `SCREAMING_SNAKE_CASE` for environment variables.

## Testing Guidelines

- Place unit tests as `*.test.ts(x)` beside source; rely on MSW fixtures in `mocks/` to isolate network calls.
- Use `bun run test:storybook` for visual and axe coverage; update snapshots only after confirming UI changes.
- Playwright specs live in `test/e2e`; capture failing artifacts from `playwright-report/` when filing issues.

## Commit & Pull Request Guidelines

- Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) to keep semantic-release automation intact.
- Before pushing, run `bun run lint` and `bun run test`; include `cdk diff` summaries when infrastructure changes.
- Pull requests should describe context, solution, linked Jira/GitHub work, and testing evidence (logs or screenshots).

## Security & Configuration Tips

- Store secrets outside the repo; export `AGENT_MODE`, `STAGE_NAME`, and AWS credentials through your shell profile.
- Validate infrastructure with `bun run cdk synth` prior to review and ensure IAM boundaries remain intact.
