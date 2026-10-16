---
name: onemac-admin-submit-split-spa
description: Create a Medicaid Split SPA in production from a Jira ticket by invoking the submitSplitSPA Lambda, including the delete-first step to force the intended suffix. Use when a Jira helpdesk ticket asks to split a Medicaid SPA or add a split SPA (e.g. MD-25-1235-A) to OneMAC.
disable-model-invocation: true
---

# OneMAC admin: submit Split SPA

Invokes `submitSplitSPA` to create the next Medicaid Split SPA from a parent package. The Lambda
computes the next `-A..-Z` suffix automatically (it does NOT take a target id).

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `packageId` — the **parent** Medicaid SPA id (e.g. `MD-25-1235`). The parent must exist in
  OneMAC and have authority `Medicaid SPA`.
- CMS authorizer and reason (for `changeReason`).

## Current contract (note)

The deployed Lambda only accepts `{ packageId, changeMade, changeReason }` and auto-appends the
next suffix via a search for `<parent>-[A-Z]`. The older wiki payload with `newPackageIdSuffix`,
`status`, `submitterEmail`, etc. is outdated and ignored.

## Payload

```json
{
  "body": {
    "packageId": "<PARENT_ID>",
    "changeMade": "<PARENT_ID> split SPA was manually added to OneMAC.",
    "changeReason": "This split SPA was created per authorization from <CMS authorizer>. Split from SPA <PARENT_ID>."
  }
}
```

## Steps

1. Confirm the target suffix the ticket wants (e.g. `-A`). The Lambda produces
   `max(existing suffix) + 1`, starting at `A` when none exist.
2. If the intended suffix already exists in OneMAC (e.g. a SEATool-sourced `<PARENT_ID>-A`), the
   Lambda would skip to the next letter. To force the intended letter, do the delete-first flow:
   explain it, ask verbatim `Is it okay?`, then delete that existing split id via
   `updatePackage` `action: delete`, wait for the sink, and continue.
3. Follow shared steps 1-6 (build payload, show it, ask verbatim `Is it okay?`). Proceed only on
   `yes`.
4. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function submitSplitSPA --payload-file <tmp.json> --yes
   ```

5. Read the result. `STATUS_CODE: 200` reports the new split id in the message. A message
   "Record must be a Medicaid SPA" means the parent authority is wrong; a 404 means the parent
   id was not found — confirm with the user.
6. Draft the finalize comment for the ticket and post only after the user approves:

   > The split SPA `<NEW_SPLIT_ID>` has been created in OneMAC. To complete the sync, please open
   > the record in SEATool and save it so the SEATool data is applied to the package.
