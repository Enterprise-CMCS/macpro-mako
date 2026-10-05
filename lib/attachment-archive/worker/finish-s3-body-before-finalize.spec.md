# Finish each S3 body before archive finalize

Source: chat, plus [OY2-41211](https://jiraent.cms.gov/browse/OY2-41211)
Status: superseded for ticket scope by `.cursor/harness/specs/oy2-41211-archive-download-timeout.md`

VAL and production logs changed the ticket claim. On 14 Aug 2026 the `MD-26-7333-SAVE` draft/all zip was already `READY` (159,113,178 bytes, finalize about 8 seconds) 86 seconds after the first download call, and the client stopped after about 57 seconds. On 11 Aug 2026 the same package did hang: `attachment_archive_finalize_starting`, then `States.Timeout` at 900 seconds. Production `CA-26-0008` shows the same hang on both the package and section archives. The harness plan drains each body before finalize and raises the build-poll cap from 20 to 40.
Repo: macpro-mako
Base branch: `val` (local `val` is fast-forwarded to `origin/val` at `f082b10d4f`)
Work branch: `oy2-41211-finish-s3-body-before-finalize`, created from that `val` tip when implementation starts
Merge target: `val`
Do not commit directly to `val`, `main`, or `production`. Do not branch this change off `main`.

## Ticket

[OY2-41211](https://jiraent.cms.gov/browse/OY2-41211) — Received error as "Attachment archive is taking longer than expected. Please try again in a few moments." when clicked on Download all attachments/section attachments buttons.

- Type: Bug. Environment in the ticket: VAL. Label: `VAL`. Component: OneMAC.
- Reported record: `MD-26-7333-SAVE`. The ticket also says a few records showed the same message.
- Ticket acceptance criteria: change the attachment archive service so downloads take significantly less time, and confirm the same attachments take less than the validated time.
- Open subtasks, not part of this code change: OY2-42087 (Validation in DEV), OY2-42088 (Validation in VAL).

The user-facing string is `DEFAULT_ARCHIVE_TIMEOUT_MESSAGE` in `react-app/src/features/package/package-activity/hook.ts`. The client throws it after 20 archive-build polls (default 3 seconds apart) while the archive is not `READY` or `FAILED`. A worker that sits in `archive.finalize()` until the 900-second task timeout produces that message. This change does not edit the poll loop or the message.

## Problem

Production package `CA-26-0008` (initial Medicaid submission, 18 attachments, 3.12 MB, all `virusScanStatus=CLEAN`) took about 37 hours before both downloadable zips were ready. Virus scan was already done. The archive worker logged `attachment_archive_zip_build_completed` and `attachment_archive_finalize_starting`, then sat inside `archive.finalize()` until the step function state `RunAttachmentArchiveWorkerTask` died with `States.Timeout` at 900 seconds. Nothing started another attempt until a later download request. Attempts that succeeded closed the zip in about a tenth of a second. The build itself is about 30 seconds when streams finish.

On current `val`, `appendSectionManifest` in `lib/attachment-archive/worker/index.ts` still calls `archive.append(toArchiverInput(result.body))` and moves on. `getAttachmentBody` returns the `GetObject` body as soon as headers arrive. `archive.finalize()` is what waits for those streams. A read that stops producing bytes blocks until the 900-second cap. `RunAttachmentArchiveWorkerTask` uses `ATTACHMENT_ARCHIVE_WORKER_TASK_TIMEOUT` (900 seconds) and has no `Retry`. Do not fix this by raising `TimeoutSeconds`.

## Change

In `appendSectionManifest`, after each `archive.append()` of a readable body, wait for Archiver's `entry` event for that append before appending the next attachment and before `run()` calls `archive.finalize()`. `append` only queues the stream. A `Buffer` input is already complete and does not need a wait.

Idle bound: 60 seconds with no `data` on that readable. The timer resets when bytes arrive, so a large file that keeps streaming is not failed for total duration. 60 seconds is well under the 900-second task cap. If the idle bound is hit, destroy that stream and fail the attempt with an `Error` whose message includes the attachment bucket and key. `run()` already catches that error and `markFailed()` writes current status `FAILED` with that message as `errorMessage` and no `failureCode`. That failure stays rebuildable, so a later download can try again. Do not add a new `ATTACHMENT_ARCHIVE_FAILURE_CODES` value. A terminal code would show a hard failure and block the retry that succeeded for hash `d108c5c1…` on 13 Aug 2026.

`archive.finalize()` then only closes the zip.

Keep skipped attachments unchanged. Do not buffer entire objects into memory. Do not change the step function timeout, and do not add a Step Functions retry in this change.

## Acceptance criteria

- A healthy section or package archive still logs `attachment_archive_finalize_starting` only after every appended entry has finished, then `attachment_archive_finalize_completed`. Existing success-path logs in `lib/attachment-archive/worker/index.test.ts` still pass.
- With more than one attachment, the next `archive.append()` does not run until the previous entry has finished.
- A body that stops producing bytes fails the worker before `archive.finalize()` hangs. The current archive status is marked `FAILED`, and `errorMessage` identifies the stalled attachment by bucket and key. The idle bound is 60 seconds per entry.
- For OY2-41211, "less than the validated time" means a stalled entry fails inside that 60-second idle bound instead of holding the attempt until the 900-second task timeout. A healthy archive is unchanged: the build is still about 30 seconds when streams finish, and finalize only closes the zip.
- `./run test --run lib/attachment-archive/worker/index.test.ts` passes.

## Out of scope

- Raising `TimeoutSeconds` on `RunAttachmentArchiveWorkerTask`.
- Adding Step Functions `Retry` after `States.Timeout`.
- ClamAV, scan gating, or attachment bytes on disk.
- Production data changes for `CA-26-0008`, and VAL data changes for `MD-26-7333-SAVE`.
- Source-scan poll cap, zip compression, and the 900-second task timeout. The build-poll cap change lives in the harness spec, not in this worker file.
- A new archive failure code, or changes to skipped-attachment behavior (related ticket OY2-40837 is already Done).
- DEV or VAL validation subtasks OY2-42087 and OY2-42088.

## Verification

From the repo root, on the work branch:

```bash
./run test --run lib/attachment-archive/worker/index.test.ts
```

## Notes for the existing archive mock

`lib/attachment-archive/worker/index.test.ts` mocks `append` as a bare `vi.fn()`. The wait added above must be satisfied by that mock, or those tests will hang. Update the mock so an append completes its entry. Add a case where the body never ends and the worker fails without calling a hanging `finalize()`.

## Review

Checked against `val` at `f082b10d4f`. No open decisions remain before implementation.

- The stall is still in this tree. `appendSectionManifest` appends and continues. `run()` logs `attachment_archive_finalize_starting` and then `await archive.finalize()`. The task timeout is still 900 seconds with no retry. The UI message in the ticket is the client poll giving up while that attempt is not `READY` or `FAILED`.
- OY2-41211 names VAL record `MD-26-7333-SAVE`. The timed-out attempt in the problem statement is production `CA-26-0008`. Both point at the same worker path. This change fixes that path. Re-checking CloudWatch for `MD-26-7333-SAVE` is not a gate for the code change.
- Failure recording stays on the existing catch path: throw, `getAttachmentArchiveFailureState`, `markFailed`. Identity is `errorMessage` with bucket and key. No new failure code.
- Idle bound is 60 seconds without bytes, reset on `data`.
- Work starts only after creating `oy2-41211-finish-s3-body-before-finalize` from current `val`. The pull request merges into `val`.
