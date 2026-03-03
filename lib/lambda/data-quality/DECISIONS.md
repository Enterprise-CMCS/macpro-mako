# Data Quality Decision Log

## Overview

This document records the current decision state for the data quality export and rule engine in `lib/lambda/data-quality/rules.ts`.

The goal is to keep a versioned record of:

- which checks are automated
- which checks are intentionally deferred
- which cohorts are included or excluded
- what the current scope and exceptions are
- which items still need business decisions

This document should be updated whenever rule behavior changes in a meaningful way.

This document intentionally avoids environment-specific baseline counts so it stays useful across dev, val, and production.

## Current Scope

- Exported indices currently in scope: `main`, `changelog`
- Indices not yet exported: `users`, `roles`
- Deleted records are excluded globally before rule evaluation
- Legacy/backfill cohorts are scoped out where they would otherwise create known false positives

## Global Decisions

- Soft-deleted records are excluded from all data quality checks.
- Timestamp checks accept either strict ISO-style dates or 13-digit Unix epoch milliseconds.
- Timestamp checks still enforce a lower bound of `2000-01-01`; pre-2000 values are intentionally flagged.
- `main` checks use cohort logic so legacy shell rows and non-app-facing rows do not inflate the report.
- `changelog` checks use cohort logic so legacy admin-change backfill rows do not inflate the report.
- `users` and `roles` checks are not currently in scope because those indices are not exported yet.

## Rule Decisions

### `DQ-001`

- Index: `main`
- Status: listed in the checklist, effectively suppressed by global delete exclusion
- Decision: do not emit violations for soft-deleted rows
- Reason: deleted rows are not app-visible and create noise
- Follow-up: none unless business wants a separate deleted-record inventory report

### `DQ-002`

- Index: `main`
- Status: automated
- Decision: only evaluate rows that have a OneMAC footprint
- Reason: blank legacy shell rows were flooding the report and are not meaningful for app-quality validation
- Current logic: require non-empty `origin` only when the row looks like an active OneMAC-managed record
- Follow-up: none for now

### `DQ-003`

- Index: `main`
- Status: automated
- Decision: only evaluate legacy-like rows
- Reason: `GSI1pk` is a legacy/backfill identifier, not a universal field
- Current logic: only check missing `GSI1pk` when a record looks legacy-derived
- Follow-up: none for now

### `DQ-004`

- Index: `main`
- Status: manual / deferred
- Decision: not automated yet
- Reason: ID validation depends on authority-specific patterns plus explicit legacy exceptions
- Follow-up: define acceptable ID formats by authority and document legacy exceptions

### `DQ-005`

- Index: `main`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires cross-system reconciliation outside OpenSearch
- Follow-up: decide what the source of truth is for SEA Tool comparison

### `DQ-006`

- Index: `main`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires cross-system reconciliation and explicit decisions for legacy record coverage
- Follow-up: define which SEA Tool records should exist in OneMAC

### `DQ-007`

- Index: `main`
- Status: automated
- Decision: require `submissionDate` only for native, non-deleted `OneMAC` records
- Reason: this field is expected on app-owned OneMAC submissions
- Follow-up: none for now

### `DQ-008`

- Index: `main`
- Status: automated
- Decision: keep `"Pending"` as a warning condition, not a hard failure
- Reason: business may allow `"Pending"` under a documented handling rule
- Follow-up: confirm whether `"Pending"` remains an accepted transitional value

### `DQ-009`

- Index: `main`
- Status: automated
- Decision: only evaluate native `OneMAC` records where `authority = Medicaid SPA`
- Reason: earlier counts were mostly legacy debt; the narrowed rule now measures live app-quality
- Current logic: flag null `proposedDate`; warn if `proposedDate = "Pending"`
- Follow-up: review whether those remaining rows require remediation or if any are acceptable exceptions

### `DQ-010`

- Index: `main`
- Status: automated
- Decision: require `submitterName` only for native, non-NOSO, non-admin-change, non-deleted OneMAC records
- Reason: submitter identity is not expected for system-generated or NOSO rows
- Follow-up: none for now

### `DQ-011`

- Index: `main`
- Status: automated
- Decision: require `submitterEmail` only for native, non-NOSO, non-admin-change, non-deleted OneMAC records
- Reason: same cohort logic as `DQ-010`
- Follow-up: none for now

### `DQ-012`

- Index: `main`, `changelog`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires S3 object existence checks plus attachment metadata validation
- Follow-up: define attachment comparison strategy between OpenSearch and S3

### `DQ-012-A`

- Index: `main`, `changelog`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires checking that indexed attachment references exist in S3
- Follow-up: add S3 existence checks per attachment key

### `DQ-012-B`

- Index: `main`, `changelog`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires reverse lookup from S3 objects to OpenSearch records
- Follow-up: decide whether S3 inventory or prefix scan is the correct source for comparison

### `DQ-012-C`

- Index: `main`, `changelog`
- Status: manual / deferred
- Decision: not automated yet
- Reason: requires record-level comparison of `attachments` content between `main` and `changelog`
- Follow-up: define how attachment drift should be evaluated

### `DQ-013`

- Index: `main`
- Status: automated
- Decision: accept ISO-style timestamps or 13-digit epoch milliseconds
- Reason: the app stores and renders ISO strings, so epoch-only validation was too strict
- Current logic: still flag values before `2000-01-01`
- Follow-up: none for now

### `DQ-014`

- Index: `main`
- Status: automated
- Decision: same timestamp logic as `DQ-013`
- Reason: `statusDate` follows the same storage patterns as other date fields
- Current logic: pre-2000 dates remain intentionally flagged
- Follow-up: confirm whether any pre-2000 values are valid historical exceptions or need correction

### `DQ-015`

- Index: `main`
- Status: automated
- Decision: keep a strict normalized authority allowlist
- Reason: non-standard values should stay visible until business explicitly approves them
- Allowed values: `Medicaid SPA`, `CHIP SPA`, `1915(b)`, `1915(c)`
- Follow-up: business decision needed on whether values like `APD`, `1115`, `ADM`, `UPL`, or `1915(c) Indep. Plus` should remain flagged or be normalized/allowed

### `DQ-016`

- Index: `main`
- Status: automated
- Decision: validate state codes strictly
- Reason: this is objective and low-risk
- Current logic: allow 50 states, DC, and supported territories
- Follow-up: review invalid values such as `AA` and `ZZ`

### `DQ-017`

- Index: `main`
- Status: automated
- Decision: validate `currentStatus` against the mapped status vocabulary, not only canonical `SEATOOL_STATUS`
- Reason: `currentStatus` is a display/legacy-facing field, not purely a canonical enum
- Current logic: accept canonical statuses, state-facing labels, CMS-facing labels, and known legacy labels
- Follow-up: review whether remaining values like `"RAI Response Withdraw Enabled"` should be mapped or remain flagged

### `DQ-018`

- Index: `main`
- Status: automated
- Decision: keep strict email format validation
- Reason: placeholder values like `"-- --"` should remain visible as bad data
- Follow-up: business decision needed on whether placeholders should be normalized to null upstream

### `DQ-019`

- Index: `main`
- Status: manual / deferred
- Decision: not automated yet
- Reason: this requires comparing exported data with UI/app rendering behavior
- Follow-up: define the comparison workflow against `/item` or UI surfaces

### `DQ-020`

- Index: `main`
- Status: automated
- Decision: validate `formalRaiReceivedDate` when present, otherwise fall back to `raiReceivedDate`
- Reason: current app behavior and existing data often use `raiReceivedDate` as the practical field
- Current logic: date must be valid, not in the future, and not before `raiRequestedDate`
- Follow-up: review whether the remaining sequencing issues are true defects

### `DQ-021`

- Index: `main`
- Status: automated
- Decision: require `changeMade` and `changeReason` for admin changes in `main`
- Reason: those are audit-critical fields when a change is represented as an admin action in the primary record
- Follow-up: none for now

### `DQ-022`

- Index: `main`
- Status: automated
- Decision: require `submitterName` and `submitterEmail` to be null for NOSO records
- Reason: NOSO records should not look like user-submitted packages
- Follow-up: confirm whether the current violating rows are seeded/test data or real data issues

### `DQ-023`

- Index: `main`
- Status: manual / deferred
- Decision: treat as a reporting/inventory exercise, not a pass/fail rule
- Reason: identifying legacy source systems requires explicit source classification
- Follow-up: decide whether to create a separate legacy source inventory output

### `DQ-024`

- Index: `changelog`
- Status: automated
- Decision: use the same timestamp rule as `DQ-013` and `DQ-014`
- Reason: changelog timestamps follow the same storage pattern assumptions
- Follow-up: none for now

### `DQ-025`

- Index: `changelog`
- Status: automated
- Decision: require valid `origin`, but skip legacy admin-change backfill rows
- Reason: historical backfill rows are not equivalent to modern changelog events and were inflating noise
- Follow-up: review the remaining blank-origin rows because they appear to be current, non-legacy events

### `DQ-026`

- Index: `changelog`
- Status: automated
- Decision: if `changeMade` or `changeReason` is present, require `isAdminChange = true`
- Reason: this is a clean integrity rule for changelog semantics
- Follow-up: none for now

### `DQ-027`

- Index: `changelog`
- Status: automated
- Decision: require `changeMade` for non-legacy admin-change rows
- Reason: legacy backfill noise was removed, but current admin-change events should still be accountable
- Follow-up: business decision needed on whether `toggle-withdraw-rai` system-generated events should be exempt

### `DQ-028`

- Index: `changelog`
- Status: automated
- Decision: require `changeReason` for non-legacy admin-change rows
- Reason: same cohort logic as `DQ-027`
- Follow-up: business decision needed on whether `toggle-withdraw-rai` system-generated events should be exempt

### `DQ-029`

- Index: `users`
- Status: not in scope
- Decision: not implemented
- Reason: the current export does not include the `users` index
- Follow-up: add `users` export before implementing this rule

### `DQ-030`

- Index: `roles`
- Status: not in scope
- Decision: not implemented
- Reason: the current export does not include the `roles` index
- Follow-up: define role ID format, then add `roles` export and validation

### `DQ-031`

- Index: `roles`
- Status: not in scope
- Decision: not implemented
- Reason: the current export does not include the `roles` index
- Follow-up: once `roles` are exported, this can reuse the existing email validator

### `DQ-032`

- Index: `roles`
- Status: not in scope
- Decision: not implemented
- Reason: the current export does not include the `roles` index
- Follow-up: once `roles` are exported, this can reuse the existing timestamp validator

## Open Questions

- Should `DQ-015` continue to flag legacy authority aliases such as `APD` and `1115`, or should those be normalized/allowed?
- Should `toggle-withdraw-rai` changelog events be exempt from `DQ-027` and `DQ-028`?
- Should placeholder values such as `"-- --"` be preserved as violations or normalized to null upstream?
- Should `DQ-019` be implemented as an API/UI comparison check, and if so, what is the source of truth?
- Should `users` and `roles` be added to the export scope for `DQ-029` through `DQ-032`?

## Next Changes

No immediate code changes are required for the current baseline.

The recommended next step is to review the current decisions with business and only make targeted rule changes after the open questions are answered.
