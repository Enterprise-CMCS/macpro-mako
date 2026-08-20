# Spec: SMART outbound Kafka ingestion + MSP_MANUAL_RECORD_CREATED

- **slug:** `oy2-40481-smart-outbound-events`
- **source:** `jira:OY2-40481`
- **status:** evidence-backed (planning; execution not requested)
- **related:** `jira:OY2-41233` (first event handler), `jira:OY2-39746` (external ID; related, not blocking this slice)
- **created:** 2026-08-20

## Goal

Connect OneMAC/Mako to Kafka topic `aws.mulesoft.onemac.events` in every environment that already consumes `aws.onemac.migration.cdc`, route messages by `operationType`, and implement the first handler for `MSP_MANUAL_RECORD_CREATED`: transform the payload onto main-index field names, upsert a hidden SMART reservation record so the package ID cannot be reused, skip CDC-style emails and side effects, and log collisions to a dedicated CloudWatch log stream when a package ID already exists.

## Confirmed decisions

These are locked from Jira OY2-40481, Jira OY2-41233, Confluence page 1381543870 (MSP Manual Record Created tab, last updated 2026-08-17), and the 2026-08-20 planning conversation.

1. **Topic:** `aws.mulesoft.onemac.events`. Consume in all environments that already consume `aws.onemac.migration.cdc`.
2. **Start offset:** `LATEST`, not `TRIM_HORIZON` / beginning. Replay is an operator offset-reset, not first-deploy behavior.
3. **Message key:** string equal to `payload.id` (SPA / package ID). Validate and fail safely on mismatch.
4. **Required envelope** (every event; extra properties allowed and must not break ingest):

   ```ts
   type SmartOnemacEvent = {
     spaWaiverId: string;
     id: string;
     correlationId: string;
     origin: "SMART";
     authority: string;
     status: string;
     createdAt: string; // ISO-8601
     createdByUserId: string;
     createdByName: string;
     createdByEmail: string;
   };
   ```

5. **`origin` is case-sensitive.** Stored and queried as `origin.keyword`. Required value is `"SMART"`. Reject `"smart"`, `"Smart"`, or `source`. Existing index values: `"OneMAC"`, `"SEATool"`, `"WMS"`, `"OneMACLegacy"`, `"SMART"`.
6. **Dispatch by `operationType`.** This spec implements `MSP_MANUAL_RECORD_CREATED` only. Unknown operation types must be ingested without poisoning the consumer (log + skip handler, or persist for later tickets).
7. **`MSP_MANUAL_RECORD_CREATED` example** (Confluence last tab + OY2-41233):

   ```json
   {
     "spaWaiverId": "a0ncp000006Wdh7AAC",
     "id": "AL-26-0817-0001",
     "correlationId": "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
     "origin": "SMART",
     "authority": "Medicaid SPA",
     "status": "Intake Needed",
     "createdAt": "2026-08-17T16:54:33.000Z",
     "createdByUserId": "005cp00000Jqq9HAAR",
     "createdByName": "Alice Jones",
     "createdByEmail": "alice.j@globalalliantinc.com",
     "operationType": "MSP_MANUAL_RECORD_CREATED",
     "creationContext": "MANUAL",
     "state": "Alabama",
     "initialSubmissionDate": "2026-08-17"
   }
   ```

8. **Do not show SMART-origin packages in package lists** for users, admins, or anyone. They exist in the main index only as ID reservations so OneMAC cannot create a colliding package.
9. **Do not run CDC-topic side effects** for SMART events: no emails, no migration-CDC business logic.
10. **Field-name alignment:** map SMART payload names onto the names the main index / package UI already uses (for example date fields). Explorer must produce the discrepancy list; do not invent mappings.
11. **Collision policy (this slice, user-confirmed 2026-08-20):** if a main-index record already exists for the same package ID, **do not upsert / overwrite**. Log the incoming payload (and enough context to debug) to a **new dedicated CloudWatch log stream**. This supersedes the older OY2-40481 note that said “only add `spaWaiverId` to the existing record.”
12. **Salesforce ID** (`spaWaiverId`) is the external identifier. Related work to persist a first-class external-ID field lives on OY2-39746; this slice must still keep `spaWaiverId` on the indexed document so later tickets can formalize it.
13. **Offset reset:** document how an operator recreates the event-source mapping / consumer group or otherwise seeks. A code comment plus a short runbook note is enough if no admin API exists.
14. **If a new Lambda is added,** register it in `.github/skills/splunk/references/source-mapping.md`.
15. **Branching:** stage-safe lowercase tokens (e.g. `oy2-40481-smart-outbound-events`). Do not commit or push in this planning run.
16. **Isolation (evidence-locked):** dedicated Kafka topic + dedicated Lambda + dedicated ESM. Do **not** publish SMART onto `aws.onemac.migration.cdc`, and do **not** route SMART through `insertOneMacRecordsFromKafkaIntoMako`, `sinkChangelog.processAndIndex`, or `processEmails`. Those are separate ESMs; a `sinkMain` switch case alone does not isolate changelog or email.
17. **List hiding (evidence-locked):** `lib/lambda/search.ts` already allowlists `origin.keyword` to `OneMAC`, `OneMACLegacy`, and `SEATool`+`event:NOSO`. `origin: "SMART"` is already excluded from every dashboard/search list. No new hide flag.
18. **ID reservation must set `seatoolStatus`:** `itemExists` / submit only block when `isActiveMainNonDraftPackage` is true (known non-draft `seatoolStatus`). A shell doc without `seatoolStatus` would **not** stop OneMAC users from creating the same ID. Reservation upserts must set a known non-draft `seatoolStatus` so UI + backend submit both fail.
19. **Collision identity (evidence-locked):** OpenSearch `_id` = business `id`. Collision = any existing main-index document with that `id`, regardless of origin. Check with `exists`/`get` before write; do not `doc_as_upsert` on collision.
20. **Dispatch key:** `operationType === "MSP_MANUAL_RECORD_CREATED"` only. `creationContext` is retained but not required to match.
21. **Unknown operation types:** validate envelope, log, skip handler. Do not throw (unlike `sinkMain` unknown-topic). Extra fields stay on the parsed object for later tickets; no second index required this slice. Kafka replay via offset reset remains the recovery path.
22. **Offset reset (docs-locked):** recreate the ESM with a **new consumer group ID**. Recreating with the same group does **not** reset offsets (`StartingPosition` is ignored). `createTriggers.ts` already mints `` `${prefix}${randomUUID()}` ``.
23. **CloudWatch collision log (docs-locked):** new log group (CDK) + named stream created via `CreateLogStream` then `PutLogEvents`. `PutLogEvents` does **not** auto-create a missing stream. No CloudWatch Logs SDK exists in-repo today.
24. **Kafka keys/values** in Lambda events are base64-encoded (AWS MSK / self-managed Kafka docs). Decode before JSON parse.

## Open questions / uncertainty

Mark these explicitly. Do not invent answers in implementation.

| ID | Question | Status | Impact if wrong |
| --- | --- | --- | --- |
| U1 | Map SMART `status` (`"Intake Needed"`) onto OneMAC `seatoolStatus` / `stateStatus` / `cmsStatus`. Which SEATOOL_STATUS constant unblocks `itemExists` without implying a real CMS workflow? | Open | ID reuse still possible, or fake statuses leak on detail. |
| U2 | Package **detail** (`item.ts` / `getPackage`) has no origin filter. A SMART reservation with `seatoolStatus` may be viewable by URL. Lists are already hidden. | Open — recommend exclude SMART in `item.ts` this slice | Users/admins can open a SMART-only package by ID. |
| U3 | Collision log group/stream names and retention (proposal: `/aws/mako/${stage}/smart-onemac-collisions` and stream `msp-manual-record-created`). Confirm before implement. | Proposed | Ops cannot find logs. |
| U5 | Persist unknown `operationType` payloads to an index vs log + skip. This slice: log + skip; replay via offset reset. | Decided for this slice | Later tickets cannot inspect dropped payloads without Kafka replay. |
| U7 | Date formats: SMART ISO strings vs OneMAC mixed epoch/`proposedDate`. Manual-create payload has `createdAt` + `initialSubmissionDate` only (no proposed date). Map `createdAt` → `submissionDate`/`makoChangedDate`/`changedDate` as ISO; store `initialSubmissionDate` as `submissionDate` if `createdAt` date-only is insufficient. | Partial | Wrong activity dates if later events reuse the doc. |
| U8 | SMART `state` is `"Alabama"`; OneMAC lists use 2-letter `state` from `id`. Derive `state` from `id` (existing transform pattern) and retain SMART `state` as extra if needed. | Proposed | State-scoped search/auth mismatches. |
| U9 | Persist `spaWaiverId` as a new main-index field this slice (OY2-39746 not in repo). No `externalId` symbol exists. | Proposed | Later rename if 39746 lands a different field. |
| U10 | Other first-wave events stay stubbed (log + skip). | Locked | Scope creep. |
| U11 | `createTriggers` (reindex, default TRIM_HORIZON) vs email-style `CfnEventSourceMapping` (LATEST, survives reindex). SMART must start LATEST and should **not** be reset to TRIM_HORIZON by data-reindex. | Open | Reindex could replay the whole SMART topic. |

## Constraints

- Isolate SMART at topic + Lambda + ESM. Never share CDC topic or CDC/email processors.
- SMART ESM `StartingPosition` / CDK `startingPosition` must be `LATEST`. Do not let data-reindex recreate it as `TRIM_HORIZON` (U11).
- Extra payload properties must not fail ingest.
- Incorrect `origin` casing is a validation failure, not a silent normalize.
- Reservation docs: `id`, `origin: "SMART"`, known non-draft `seatoolStatus`, plus mapped display fields. Collision: exists-by-`id` then CloudWatch log; no write.
- Tests sit beside handlers (`*.test.ts`). Cover happy path, missing required fields, key/`id` mismatch, extra unknown properties, bad `origin` casing, `MSP_MANUAL_RECORD_CREATED` upsert + list-hidden, `itemExists` blocks same ID, collision log-only, unknown `operationType` skip, and no-email / no-CDC-side-effects.
- Prefer repo `./run test --run <path>` and `bun run lint` over invented gates.
- New Lambda must be added to `.github/skills/splunk/references/source-mapping.md`.
- No secrets in harness artifacts.
- PlanPacket-only this run: no implement, commit, push, review, or ship.

## Evidence

### External

- [OY2-40481](https://jiraent.cms.gov/browse/OY2-40481) — ingestion foundation; topic, envelope, LATEST offset, extra properties, offset reset.
- [OY2-41233](https://jiraent.cms.gov/browse/OY2-41233) — MSP Manual Record Created; not intended to create/show a SPA on the UI unless it already exists; store Salesforce ID as external ID.
- [Medicaid SPA Outbound SMART→OneMAC](https://confluenceent.cms.gov/pages/viewpage.action?pageId=1381543870) — event inventory and last-tab `MSP_MANUAL_RECORD_CREATED` payload.
- User 2026-08-20: hide SMART-origin packages; transform field names; no CDC emails; collision → new CloudWatch log stream only.

### Repository (explorer)

| Area | Evidence |
| --- | --- |
| No SMART Kafka consumer | Zero matches for `aws.mulesoft.onemac.events`. SMART today is UI flag + `checkIdentifierUsage` tests expecting `origin: "SMART"`. |
| CDC topic | `` `${topicNamespace}aws.onemac.migration.cdc` `` in `lib/stacks/parent.ts`, `data.ts`, `api.ts`. |
| `sinkMain` | `lib/lambda/sinkMain.ts` `getTopic` + switch; unknown topic throws. `insertOneMacRecordsFromKafkaIntoMako` in `sinkMainProcessors.ts`. |
| Changelog | Separate ESM on same CDC topic → `sinkChangelog` / `processAndIndex`. |
| Emails | `lib/stacks/email.ts` `SinkSESTriggerOnemac` LATEST on CDC; `processEmails.ts` no-ops unless `origin === "mako"` (user-role path has no origin gate). |
| ESM start | `createTriggers.ts` default `TRIM_HORIZON`; email CDK `startingPosition: "LATEST"`. New consumer group UUID on recreate. |
| Search hide | `lib/lambda/search.ts` origin allowlist — SMART already excluded from lists. |
| ID block | `itemExists` + `isActiveMainNonDraftPackage` (`packageStatus.ts`) needs `seatoolStatus`. `checkIdentifierUsage` blocks any non-deleted `id`. |
| Upsert | `bulkUpdateData` (`opensearch-lib.ts`): `_id = doc.id`, `doc_as_upsert: true`. |
| Logging | pino/`logError` → default Lambda stream only. No `@aws-sdk/client-cloudwatch-logs`. |
| OY2-39746 | Not in repo. No `spaWaiverId` / `externalId` symbols. |
| Splunk | `.github/skills/splunk/references/source-mapping.md` — add new Lambda. |

Explorer agents: [Kafka CDC ingest](6b768c98-9c78-4154-95ed-4fb1f0809732), [index hide and IDs](e7fa3495-989a-41c0-b215-59bafa1ff0e8).

### Docs (docs-researcher)

| Claim | Result |
| --- | --- |
| Kafka ESM `LATEST` / `TRIM_HORIZON` | Verified. Existing consumer group offset overrides `StartingPosition`. https://docs.aws.amazon.com/lambda/latest/dg/kafka-starting-positions.html |
| Recreate mapping to reset offsets | Only if **new** consumer group. Same group resumes committed offset. https://docs.aws.amazon.com/lambda/latest/dg/kafka-consumer-group-id.html |
| CloudWatch named stream | `CreateLogStream` then `PutLogEvents`. Put does **not** auto-create stream. CDK can pre-create log **group**. |
| OpenSearch exists + index | `client.exists` / `get` / `index` / `create`. Installed `@opensearch-project/opensearch@3.6.0`. Repo uses `get` + bulk `doc_as_upsert`. Preflight exists is race-prone; `op_type=create` is atomic. |
| Lambda Kafka payload | `topic`, `partition`, `offset`, `timestamp`, `key`, `value`; key and value base64. https://docs.aws.amazon.com/lambda/latest/dg/with-msk.html |

Docs researcher: [Kafka and logs docs](3c38cf6d-86dc-4399-8152-1ce9ff0dc13c).

### Candidate SMART → main-index field map (evidence + Confluence example)

| SMART payload | Main index | Notes |
| --- | --- | --- |
| `id` | `id` / `_id` | Uppercase if other handlers do (`normalizedId`). |
| `origin` | `origin` | Exact `"SMART"`. Hides from `search.ts`. |
| `authority` | `authority` | e.g. `"Medicaid SPA"`. |
| `state` | `state` | Prefer 2-letter from `id` (U8). SMART sends full name. |
| `status` | `seatoolStatus` + `stateStatus`/`cmsStatus` | U1 — must be a known non-draft status so `itemExists` blocks. |
| `createdAt` | `submissionDate`, `makoChangedDate`, `changedDate`, `statusDate` | ISO. |
| `initialSubmissionDate` | `submissionDate` (date-only) | Prefer `createdAt` for timestamp fields. |
| `createdByName` | `submitterName` | Display field. |
| `createdByEmail` | `submitterEmail` | Display field. |
| `spaWaiverId` | `spaWaiverId` (new) | Keep until OY2-39746. |
| `correlationId` | `correlationId` (retain) | Extra. |
| `operationType` | `operationType` (retain) | Extra. |
| `creationContext` | `creationContext` (retain) | Extra. |
| `createdByUserId` | `createdByUserId` (retain) | Extra. |
| — | `deleted` | `false`. |
| — | `proposedDate` | Not on this event. Leave unset. |

## Out of scope

- Full handlers for `MSP_STATUS_UPDATED`, `MSP_SPLIT_SPA_CREATED`, `MSP_RAI_WITHDRAWAL_TOGGLED`, `MSP_ASSIGNMENT_UPDATED` (follow-on tickets OY2-41234–41237).
- Changing SMART / MuleSoft producers.
- Showing SMART-only records in any OneMAC UI list or detail workflow as a new submission.
- Sending emails or running migration-CDC business logic for SMART events.
- Merging SMART fields onto an existing OneMAC package on collision (older Jira note; deferred).
- Completing OY2-39746 external-ID schema work beyond keeping `spaWaiverId` on the document.
- Commits, PRs, deploy, review, or ship in this planning run.

## Acceptance (spec-level)

1. Consumer is wired to `aws.mulesoft.onemac.events` in all CDC-consuming environments and starts at `LATEST`.
2. Invalid messages (missing required fields, key ≠ `id`, `origin` !== `"SMART"`) are logged and skipped without poisoning the consumer.
3. Extra properties are retained or forwarded.
4. `operationType === "MSP_MANUAL_RECORD_CREATED"` transforms onto main-index names and upserts a document that package-list queries exclude.
5. A later OneMAC create/submit for the same `id` is blocked by the existing main-index document.
6. SMART ingest does not send emails or invoke CDC migration handlers.
7. If `id` already exists, no document mutation; a write appears on the dedicated CloudWatch log stream.
8. Operator offset-reset is documented.
9. Unit tests cover the cases listed under Constraints.
10. New Lambda (if any) is in the Splunk source map.

## Implementation notes for later execute

- New handler (suggested name `sinkSmart` / `sinkMulesoftOnemac`) + CDK wiring in `lib/stacks/data.ts` (topic create in non-prod like CDC; dedicated ESM with `LATEST`; exclude from reindex `createTriggers` TRIM_HORIZON lists unless U11 is resolved by passing `startingPosition: "LATEST"` **and** accepting replay — prefer email-style standalone ESM).
- Export handler from `lib/lambda/index.ts`. Register Splunk source-mapping.
- Decode Kafka key/value from base64; validate key === `payload.id`; reject `origin !== "SMART"`.
- Dispatcher on `operationType`; first handler `MSP_MANUAL_RECORD_CREATED`.
- Reservation write: `exists`/`get` by `id`; on miss, index (prefer create/`op_type=create`); on hit, `CreateLogStream` (idempotent) + `PutLogEvents` to collision group/stream.
- Collision log payload: `id`, `spaWaiverId`, `correlationId`, `operationType`, existing `origin`, incoming body. No secrets.
- Tests: new `*.test.ts` beside handler; do not route through `sinkMain.test.ts` CDC fixtures.
- Offset-reset runbook: delete ESM, recreate with **new** consumer group + `LATEST` (or `TRIM_HORIZON`/`AT_TIMESTAMP` only when replaying). Comment in CDK + short note in handler or `AGENTS.md` is enough.
