# Waiver: repo-wide `bun run test-tsc` for oy2-40481-smart-outbound-events

- **written:** 2026-08-24T19:37:33Z
- **decided by:** user
- **spec:** `.cursor/harness/specs/oy2-40481-smart-outbound-events.md`
- **PlanPacket:** `.cursor/harness/runs/20260824T171430Z-plan-packet.json` (not edited)

## Decision

`bun run test-tsc` exit 0 is **waived** as a blocking gate for this slice.

The blocking typecheck is **`bun run build`** (`build:lib` + `build:archive` + `build:mocks` + `build:ui` + `build:cli`) with no compilation errors.

## Why

`test-tsc` is root `tsc --skipLibCheck --noEmit` over `lib/**/*`, `react-app/**/*`, `test/**/*`, and `mocks/**/*`. The root `tsconfig.json` does not define the React app `@/*` alias (that lives only in `react-app/tsconfig.json`). Inventory during harness-review: ~2852 errors, zero in SMART-changed production paths. The same baseline exists on `main`. CI does not run `test-tsc`; it runs `bun run build`.

## Still blocking

- `bun run build` fails, or
- `test-tsc` reports errors in SMART-changed production paths (`lib/lambda/sinkSmart.ts`, `lib/lambda/smart/**`, `lib/stacks/data.ts`, `lib/lambda/item.ts`, `lib/lambda/index.ts`).

## Evidence already collected

Harness-review verifier round 3: `bun run build` exit 0; `test-tsc` 2852 errors with zero matches for those SMART paths. Focused tests, lint, isolation, and secrets scan passed.
