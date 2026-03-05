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

- Exported indices currently in scope: `main`, `changelog`, `users`, `roles`
- Deleted records are excluded globally before rule evaluation
- Legacy/backfill cohorts are scoped out where they would otherwise create known false positives

## Global Decisions

- Soft-deleted records are excluded from all data quality checks.
- Timestamp checks accept either strict ISO-style dates or 13-digit Unix epoch milliseconds.
- Timestamp checks still enforce a lower bound of `2000-01-01`; pre-2000 values are intentionally flagged.
- `main` checks use cohort logic so legacy shell rows and non-app-facing rows do not inflate the report.
- `changelog` checks use cohort logic so legacy admin-change backfill rows do not inflate the report.
- `users` and `roles` are now included in the export scope so `DQ-029` through `DQ-032` run in the same report.

## Rule Decisions

### `DQ-001`

- Original check (checklist): Identify all soft-deleted records
- Original expected result: All deleted=true records documented with reason
- Index: `main`
- Status: automated (separate output)
- Decision: do not emit rule violations for soft-deleted rows, but export them to a dedicated `DQ-001` CSV
- Reason: deleted rows are not app-visible for quality checks, but business still needs an auditable inventory
- Current logic: global rule evaluation still excludes `deleted=true` rows, and `main` export writes a dedicated `dq001-deleted-main.csv` sheet
- Follow-up: add/standardize a deletion reason field if business wants reason-level validation

### `DQ-002`

- Original check (checklist): Records with NULL or empty Origin values
- Original expected result: Zero records with NULL origin OR documented exceptions?
- Index: `main`
- Status: automated
- Decision: only evaluate rows that have a OneMAC footprint
- Reason: blank legacy shell rows were flooding the report and are not meaningful for app-quality validation
- Current logic: require non-empty `origin` only when the row looks like an active OneMAC-managed record
- Follow-up: none for now

### `DQ-003`

- Original check (checklist): Records with NULL GSI1pk values
- Original expected result: Document all records with NULL GSI1pk and confirm they should be hidden
- Index: `main`
- Status: automated
- Decision: only evaluate legacy-like rows
- Reason: `GSI1pk` is a legacy/backfill identifier, not a universal field
- Current logic: only check missing `GSI1pk` when a record looks legacy-derived
- Follow-up: none for now

### `DQ-004`

- Original check (checklist): ID Format validation per authority type
- Original expected result: All IDs follow standard naming convention OR documented as legacy exception
- Index: `main`
- Status: automated
- Decision: validate `id` format for native OneMAC records using authority-specific patterns (`Medicaid SPA`, `CHIP SPA`, and `1915*` waiver ids)
- Reason: regex patterns are already defined in submission schemas and can be reused consistently for data quality
- Follow-up: none for now

### `DQ-005`

- Original check (checklist): OneMAC submissions missing in SEA Tool
- Original expected result: Zero missing records OR documented reason (e.g., deleted, admin change)
- Index: `main`
- Status: automated (heuristic)
- Decision: warn when native OneMAC records appear unlinked to SEA Tool after a grace period
- Reason: we do not have a direct SEA Tool source-of-truth join in this export, so this is an operational heuristic
- Current logic: for non-deleted, non-admin-change, non-NOSO `origin=OneMAC` records, flag when `submissionDate` is older than 24 hours and `changed_date` is still missing
- Follow-up: keep as warning-level signal; upgrade to strict validation only if a direct SEA Tool reconciliation source is added

### `DQ-006`

- Original check (checklist): SEA Tool submissions not found in OneMAC
- Original expected result: Document which legacy system records should/should not appear in OneMAC
- Index: `main`
- Status: automated (heuristic)
- Decision: warn on explicit `origin=SEATool` records that still have no OneMAC footprint after a grace period
- Reason: this avoids flooding on blank-origin legacy rows while preserving a targeted SEA Tool reconciliation signal
- Current logic: for non-deleted, non-admin-change, non-NOSO `origin=SEATool` records with `changed_date`, warn when `changed_date` is older than 24 hours and OneMAC footprint fields (`submissionDate`, `submitterName`, `submitterEmail`, `packageId`, `makoChangedDate`) are all missing
- Follow-up: keep as warning-level signal; treat as inventory/reporting unless business defines strict reconciliation criteria

### `DQ-007`

- Original check (checklist): NULL submissionDate for OneMAC-originated records
- Original expected result: Zero NULL values for OneMAC-originated records
- Index: `main`
- Status: automated
- Decision: require `submissionDate` only for native, non-deleted `OneMAC` records
- Reason: this field is expected on app-owned OneMAC submissions
- Follow-up: none for now

### `DQ-008`

- Original check (checklist): Proposed effective date = "Pending"
- Original expected result: List all "Pending" records; define SMART handling rule
- Index: `main`
- Status: automated
- Decision: keep `"Pending"` as a warning condition, not a hard failure
- Reason: business may allow `"Pending"` under a documented handling rule
- Follow-up: confirm whether `"Pending"` remains an accepted transitional value

### `DQ-009`

- Original check (checklist): NULL proposedDate for Medicaid SPAs
- Original expected result: Zero NULL values OR value = "Pending" with documentation
- Index: `main`
- Status: automated
- Decision: only evaluate native `OneMAC` records where `authority = Medicaid SPA`
- Reason: earlier counts were mostly legacy debt; the narrowed rule now measures live app-quality
- Current logic: flag null `proposedDate`; warn if `proposedDate = "Pending"`
- Follow-up: review whether those remaining rows require remediation or if any are acceptable exceptions

### `DQ-010`

- Original check (checklist): NULL submitterName for non-NOSO records
- Original expected result: Zero NULL values for non-NOSO submissions
- Index: `main`
- Status: automated
- Decision: require `submitterName` only for native, non-NOSO, non-admin-change, non-deleted OneMAC records
- Reason: submitter identity is not expected for system-generated or NOSO rows
- Follow-up: none for now

### `DQ-011`

- Original check (checklist): NULL submitterEmail for non-NOSO records
- Original expected result: Zero NULL values for non-NOSO submissions
- Index: `main`
- Status: automated
- Decision: require `submitterEmail` only for native, non-NOSO, non-admin-change, non-deleted OneMAC records
- Reason: same cohort logic as `DQ-010`
- Follow-up: none for now

### `DQ-012`

- Original check (checklist): Mandatory attachments missing in S3
- Original expected result: Zero missing records
- Index: `main`, `changelog`
- Status: automated
- Decision: validate each indexed attachment with S3 `HeadObject` and flag missing objects
- Reason: attachment records already include `bucket` and `key`; object existence can be checked directly
- Follow-up: none for now

### `DQ-012-A`

- Original check (checklist): Submissions with no attachments in S3 but main index or changelog has attachments data
- Original expected result: Zero discrepancies
- Index: `main`, `changelog`
- Status: automated
- Decision: if attachment metadata exists but no resolvable S3 object is found, flag discrepancy
- Reason: direct continuation of `DQ-012` object existence checks at the submission level
- Follow-up: none for now

### `DQ-012-B`

- Original check (checklist): Submissions with attachments in S3 but main index or changelog has NO attachments data
- Original expected result: Zero discrepancies
- Index: `main`, `changelog`
- Status: automated
- Decision: list objects from the configured attachments bucket and flag unreferenced objects older than a grace period
- Reason: with attachments consolidated in the same account, direct bucket-to-index reconciliation is now practical
- Current logic: compare S3 object keys in `ATTACHMENTS_BUCKET_NAME` against all `main`/`changelog` attachment references and emit summary + sample keys for unreferenced objects older than 24 hours
- Follow-up: once migration fully completes, consider replacing list-based scan with S3 Inventory for larger-scale efficiency

### `DQ-012-C`

- Original check (checklist): Submissions with no attachments in main but attachments in changelog
- Original expected result: Zero discrepancies OR documented reason
- Index: `main`, `changelog`
- Status: automated
- Decision: during runs that include both indices, flag changelog records with attachments when the corresponding main record has none
- Reason: record-level comparison is feasible using shared package-level identifiers
- Follow-up: decide whether to also emit paired violations on the main side

### `DQ-013`

- Original check (checklist): Validate timestamp format (Unix epoch milliseconds)
- Original expected result: All timestamps in valid Unix epoch milliseconds range
- Index: `main`
- Status: automated
- Decision: accept ISO-style timestamps or 13-digit epoch milliseconds
- Reason: the app stores and renders ISO strings, so epoch-only validation was too strict
- Current logic: still flag values before `2000-01-01`
- Follow-up: none for now

### `DQ-014`

- Original check (checklist): Validate timestamp format (Unix epoch milliseconds)
- Original expected result: All timestamps in valid Unix epoch milliseconds range
- Index: `main`
- Status: automated
- Decision: same timestamp logic as `DQ-013`
- Reason: `statusDate` follows the same storage patterns as other date fields
- Current logic: pre-2000 dates remain intentionally flagged
- Follow-up: confirm whether any pre-2000 values are valid historical exceptions or need correction

### `DQ-015`

- Original check (checklist): Invalid authority values
- Original expected result: All records have valid authority value
- Index: `main`
- Status: automated
- Decision: keep a strict normalized authority allowlist
- Reason: non-standard values should stay visible until business explicitly approves them
- Allowed values: `Medicaid SPA`, `CHIP SPA`, `1915(b)`, `1915(c)`
- Follow-up: business decision needed on whether values like `APD`, `1115`, `ADM`, `UPL`, or `1915(c) Indep. Plus` should remain flagged or be normalized/allowed

### `DQ-016`

- Original check (checklist): Invalid state codes
- Original expected result: All state codes valid (50 states + DC + 5 territories)
- Index: `main`
- Status: automated
- Decision: validate state codes strictly
- Reason: this is objective and low-risk
- Current logic: allow 50 states, DC, and supported territories
- Follow-up: review invalid values such as `AA` and `ZZ`

### `DQ-017`

- Original check (checklist): Invalid status values
- Original expected result: All records have valid status value
- Index: `main`
- Status: automated
- Decision: validate `currentStatus` against the mapped status vocabulary, not only canonical `SEATOOL_STATUS`
- Reason: `currentStatus` is a display/legacy-facing field, not purely a canonical enum
- Current logic: accept canonical statuses, state-facing labels, CMS-facing labels, and known legacy labels
- Follow-up: review whether remaining values like `"RAI Response Withdraw Enabled"` should be mapped or remain flagged

### `DQ-018`

- Original check (checklist): Invalid email format
- Original expected result: All email addresses follow valid format
- Index: `main`
- Status: automated
- Decision: keep strict email format validation
- Reason: placeholder values like `"-- --"` should remain visible as bad data
- Follow-up: business decision needed on whether placeholders should be normalized to null upstream

### `DQ-019`

- Original check (checklist): RAI date discrepancies between export and UI
- Original expected result: All RAI dates consistent between export and UI
- Index: `main`
- Status: automated
- Decision: compare `raiReceivedDate`, `formalRaiReceivedDate`, and `latestRaiResponseTimestamp` when present and flag mismatches
- Reason: these fields drive UI-facing RAI date behavior and should stay internally consistent
- Current logic: warn when latest timestamp exists but `raiReceivedDate` is missing or when date values diverge beyond tolerance
- Follow-up: none for now

### `DQ-020`

- Original check (checklist): Formal RAI Response Date logical consistency
- Original expected result: Formal RAI response date should be >= RAI requested date and not in future
- Index: `main`
- Status: automated
- Decision: validate `formalRaiReceivedDate` when present, otherwise fall back to `raiReceivedDate`
- Reason: current app behavior and existing data often use `raiReceivedDate` as the practical field
- Current logic: date must be valid, not in the future, and not before `raiRequestedDate`
- Follow-up: review whether the remaining sequencing issues are true defects

### `DQ-021`

- Original check (checklist): Admin changes missing changeMade or changeReason
- Original expected result: All admin changes have changeMade and changeReason populated
- Index: `main`
- Status: automated
- Decision: require `changeMade` and `changeReason` for admin changes in `main`
- Reason: those are audit-critical fields when a change is represented as an admin action in the primary record
- Follow-up: none for now

### `DQ-022`

- Original check (checklist): NOSO records not properly identified
- Original expected result: All NOSO records have NULL submitterName and submitterEmail
- Index: `main`
- Status: automated
- Decision: require `submitterName` and `submitterEmail` to be null for NOSO records
- Reason: NOSO records should not look like user-submitted packages
- Follow-up: confirm whether the current violating rows are seeded/test data or real data issues

### `DQ-023`

- Original check (checklist): Identify all legacy system records (WMS/MMDL, MACPro)
- Original expected result: Document all legacy system sources and record counts
- Index: `main`
- Status: automated (separate output)
- Decision: generate legacy source inventory as a dedicated `DQ-023` CSV, not as rule violations
- Reason: this is an inventory/reporting check and should not inflate violation totals
- Current logic: classify likely legacy records using `origin`, `pk`, and `GSI1pk` signals into source buckets and export summarized counts to `dq023-legacy-inventory-main.csv`
- Follow-up: refine source heuristics if business wants stricter source attribution

### `DQ-024`

- Original check (checklist): Validate changelog timestamp format
- Original expected result: All timestamps in valid Unix epoch milliseconds range
- Index: `changelog`
- Status: automated
- Decision: use the same timestamp rule as `DQ-013` and `DQ-014`
- Reason: changelog timestamps follow the same storage pattern assumptions
- Follow-up: none for now

### `DQ-025`

- Original check (checklist): NULL or invalid origin in changelog
- Original expected result: All changelog events have valid origin
- Index: `changelog`
- Status: automated
- Decision: require valid `origin`, but skip legacy admin-change backfill rows
- Reason: historical backfill rows are not equivalent to modern changelog events and were inflating noise
- Follow-up: review the remaining blank-origin rows because they appear to be current, non-legacy events

### `DQ-026`

- Original check (checklist): Admin changes in changelog missing isAdminChange flag
- Original expected result: All records with changeMade/changeReason have isAdminChange=true
- Index: `changelog`
- Status: automated
- Decision: if `changeMade` or `changeReason` is present, require `isAdminChange = true`
- Reason: this is a clean integrity rule for changelog semantics
- Follow-up: none for now

### `DQ-027`

- Original check (checklist): Verify changeMade populated for admin changes
- Original expected result: All admin changes have changeMade value
- Index: `changelog`
- Status: automated
- Decision: require `changeMade` for non-legacy admin-change rows
- Reason: legacy backfill noise was removed, but current admin-change events should still be accountable
- Follow-up: business decision needed on whether `toggle-withdraw-rai` system-generated events should be exempt

### `DQ-028`

- Original check (checklist): Verify changeReason populated for admin changes
- Original expected result: All admin changes have changeReason value
- Index: `changelog`
- Status: automated
- Decision: require `changeReason` for non-legacy admin-change rows
- Reason: same cohort logic as `DQ-027`
- Follow-up: business decision needed on whether `toggle-withdraw-rai` system-generated events should be exempt

### `DQ-029`

- Original check (checklist): Validate state access list for state users
- Original expected result: All state users have at least one state assigned
- Index: `users`
- Status: automated
- Decision: cross-reference `users` to `roles` by `email`; if user has active state-user roles, require at least one valid territory assignment in those role records
- Reason: `users` rows do not reliably carry role/state scope; the `roles` index is the source of truth for granted state access
- Current logic: aggregate active `statesubmitter`/`statesystemadmin` roles by `email` from `roles`, then validate corresponding `users` rows have at least one valid territory (not `N/A`/`ZZ`)
- Follow-up: none for now

### `DQ-030`

- Original check (checklist): Validate role ID format
- Original expected result: All role IDs follow standard format
- Index: `roles`
- Status: automated
- Decision: require non-empty role `id` and validate it follows `email_territory_role` composition
- Reason: role records are generated from those fields; drift indicates malformed index data
- Follow-up: none for now

### `DQ-031`

- Original check (checklist): Validate email format in roles
- Original expected result: All email addresses follow valid format
- Index: `roles`
- Status: automated
- Decision: validate non-empty role `email` values with the same standard email regex used elsewhere
- Reason: objective format check with low false-positive risk
- Follow-up: none for now

### `DQ-032`

- Original check (checklist): Validate role modification timestamp
- Original expected result: All timestamps in valid Unix epoch milliseconds range
- Index: `roles`
- Status: automated
- Decision: require non-empty `lastModifiedDate` and validate timestamp format/range
- Reason: role lifecycle history depends on a reliable modification timestamp
- Follow-up: none for now

## Open Questions

- Should `DQ-015` continue to flag legacy authority aliases such as `APD` and `1115`, or should those be normalized/allowed?
- Should `toggle-withdraw-rai` changelog events be exempt from `DQ-027` and `DQ-028`?
- Should placeholder values such as `"-- --"` be preserved as violations or normalized to null upstream?

## Next Changes

The current baseline now covers `main`, `changelog`, `users`, and `roles`.

The recommended next step is to review findings with business and tune thresholds/cohorts where noise remains (especially reconciliation-style checks and legacy-source heuristics).
