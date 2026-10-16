---
name: onemac-admin-update-id
description: Renumber/change a OneMAC package id in production from a Jira ticket by invoking the updatePackage Lambda with action update-id, including the delete-first fix when the target id already exists. Use when a Jira helpdesk ticket asks to update, renumber, or change a package/SPA/waiver id (e.g. "renumber AZ-14-001 to AZ-14-0001").
disable-model-invocation: true
---

# OneMAC admin: update package id

Invokes `updatePackage` with `action: "update-id"` to change a package id. Handles the common
case where the **target** id already exists in SEATool/OpenSearch (the Lambda rejects it), by
deleting the target first, waiting for the sink, then retrying.

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `packageId` — current/old id (e.g. `AZ-14-001`).
- `updatedId` — new/target id (e.g. `AZ-14-0001`). Must differ from `packageId`. The Lambda
  enforces only a basic id shape (uppercase, e.g. `AZ-14-0001`); it does not validate the full
  per-type format, so supply a correctly formatted new id.
- CMS authorizer and reason (for `changeReason`).

The Lambda reads the existing record itself, so no other package data is needed.

## Payload

```json
{
  "body": {
    "packageId": "<OLD_ID>",
    "action": "update-id",
    "updatedId": "<NEW_ID>",
    "changeMade": "SPA ID changed from <OLD_ID> to <NEW_ID>",
    "changeReason": "This package ID change was made per authorization from <CMS authorizer> because <reason>."
  }
}
```

## Steps

1. Follow shared steps 1-6 (extract ids + authorizer/reason, build payload, show it, ask
   verbatim `Is it okay?`). Proceed only on `yes`.
2. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function updatePackage --payload-file <tmp.json> --yes
   ```

3. Interpret the result:
   - `STATUS_CODE: 200` -> success. Go to step 5.
   - `MARKER: ID_ALREADY_EXISTS` (or message `This ID already exists`) -> the target id exists;
     do the delete-first flow in step 4.
4. Delete-first flow (only on the collision):
   - Explain that `<NEW_ID>` already exists and must be deleted first, then ask verbatim
     `Is it okay?`. Proceed only on `yes`.
   - Delete the **target** id with the same change text:

     ```json
     {
       "body": {
         "packageId": "<NEW_ID>",
         "action": "delete",
         "changeMade": "<NEW_ID> deleted to allow renumber of <OLD_ID>",
         "changeReason": "This package deletion was made per authorization from <CMS authorizer> because <reason>."
       }
     }
     ```

     ```bash
     bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
       --function updatePackage --payload-file <delete-tmp.json> --yes
     ```

   - Wait for the Kafka sink: re-run the update-id invoke with a short backoff (a few attempts
     ~20-30s apart). Stop retrying once it returns `STATUS_CODE: 200`; if it still collides
     after several attempts, stop and report.

5. Draft the finalize comment for the ticket and post only after the user approves:

   > The OneMAC package id has been updated to `<NEW_ID>`. To complete the sync, please open the
   > record in SEATool and save it; that re-sends it through Kafka so the SEATool data is applied
   > to the package.

6. Report the final status and what was done (including whether a delete-first was needed).
