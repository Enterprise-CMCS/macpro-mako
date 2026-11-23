# Playwright E2E suite

Five trusted journey specs run in two tiers:

| Tier | What it hits | When it runs | Blocks merges? |
| --- | --- | --- | --- |
| **Mocked** | Vite on `:5000` + `@msw/playwright` stateful backend | Every push (`.github/workflows/e2e.yml`, 2 shards) | Yes (required check once enabled) |
| **Deployed** | Stage CloudFront app; only third-party hosts mocked | Post-deploy in `.github/workflows/deploy.yml` | Not yet (`continue-on-error: true`) |

## Layout

```text
test/
  playwright.config.ts
  quarantine.txt                 # Playwright --test-list format
  e2e/journeys/                  # 01–05 journey specs
  e2e/setup/auth.setup.ts
  fixtures/                      # network, backend store, third-party stubs
  lib/                           # auth helpers, ids, auth.secrets.ts
  scripts/flaky-report.ts
  specs/                         # Markdown plans from the planner agent
```

### Playwright projects

- `mocked-setup` → `mocked` (all five journeys; sharded; `grepInvert: /@quarantine/`)
- `deployed-setup` → `deployed-create` (journey 02) → `deployed-read` (01, 03, 05) → `deployed-mutate` (04 last)

Blocking CI also passes `--test-list-invert quarantine.txt`.

## Commands

```bash
# Mocked tier (default) — no AWS credentials
./run e2e
./run e2e --ui
./run e2e --shard=1/2 --test-list-invert quarantine.txt
./run e2e --grep "Submit" --run-agents=missing

# Deployed tier — requires MACPro AWS credentials; sets E2E_BASE_URL from SSM
./run e2e --deployed
./run e2e --deployed --stage main
./run e2e --deployed --ui --stage <feature-stage>
```

From `test/` you can also use the package scripts (`bun run e2e`, `bun run e2e:deployed`, `bun run e2e:quarantine`, …).

## Adding a journey (agent workflow)

1. **Planner** — write a Markdown plan under `test/specs/` from the user story (`playwright` planner agent / Cursor agent).
2. **Generator** — generate deterministic TypeScript into `e2e/journeys/` with user-facing locators (`getByRole`, `getByLabel`, `getByText`) and web-first assertions.
3. **Healer** — run locally only (never in CI). CI keeps `runAgents: 'none'`.
4. If a journey uses `page.perform(...)`, run locally with `--run-agents=missing` and **commit the generated cache** so CI can replay without an LLM.
5. Prove stability before merge: `./run e2e --repeat-each=10` (mocked) with zero flakes.

Browsing MCP (`@playwright/mcp`) can explore the app at `http://localhost:5000` while drafting journeys.

## Quarantine policy

A test is **flaky** when it fails once and then passes on its single CI retry (JSON report `status: "flaky"`).

- Blocking mocked runs exclude entries in `quarantine.txt` via `--test-list-invert`.
- `scripts/flaky-report.ts` writes a step-summary table and `::warning` annotations.
- On `main` (with `GITHUB_TOKEN`), it appends new flakes to `quarantine.txt`, opens a `chore(e2e): quarantine flaky tests` PR, and opens/updates an issue labeled `e2e-flaky`.
- Nightly job (schedule on `e2e.yml`) runs `--test-list quarantine.txt --repeat-each=5 --retries=0` (non-blocking) to show which quarantined tests are stable again.
- Owner has **2 weeks** to fix, prove stable in the nightly run, and remove the entry. Otherwise delete the test.

## Deployed-tier exit criterion

The deploy workflow e2e job stays `continue-on-error: true` until **main has 10 consecutive green deployed runs**. After that, remove `continue-on-error` so deployed failures surface.

## Reports

- CI mocked shards upload Playwright **blob** reports; the `report` job runs `merge-reports` into HTML + JSON and then `flaky-report.ts`.
- Deployed post-deploy job merges its blob report the same way and runs the flaky detector.
