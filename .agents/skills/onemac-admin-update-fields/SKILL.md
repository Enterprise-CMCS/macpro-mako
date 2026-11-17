---
name: onemac-admin-update-fields
description: Update field values on a OneMAC package in production from a Jira ticket by invoking the updatePackage Lambda with action update-values. Use when a Jira helpdesk ticket asks to change a package field such as title, a date, or CHIP submission type.
disable-model-invocation: true
---

# OneMAC admin: update field values

Invokes `updatePackage` with `action: "update-values"` to change one or more fields on an
existing package.

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `packageId` — id to update.
- `updatedFields` — object of field -> new value.
- CMS authorizer and reason (for `changeReason`).

## Lambda rules (enforce before invoking)

- Each field must already exist on the record, except these allowed new fields:
  `chipSubmissionType`, `event`, `mockEvent`.
- `event` / `mockEvent` must be a known package event name.
- `chipSubmissionType` is only valid for `CHIP SPA` packages and must be a non-empty array of:
  `MAGI Eligibility and Methods`, `Non-Financial Eligibility`, `XXI Medicaid Expansion`,
  `Eligibility Process`.
- `id` cannot be updated here (use `onemac-admin-update-id`).
- Date fields MUST be epoch milliseconds, or the update silently fails. Affected fields:
  `approvedEffectiveDate`, `changedDate`, `finalDispositionDate`, `proposedDate`, `statusDate`,
  `submissionDate`. Convert any human date to epoch-ms and confirm with the user.

## Payload

```json
{
  "body": {
    "packageId": "<ID>",
    "action": "update-values",
    "updatedFields": { "<field>": "<value>" },
    "changeMade": "<field(s)> updated",
    "changeReason": "This field update was made per authorization from <CMS authorizer> because <reason>."
  }
}
```

## Steps

1. Validate `updatedFields` against the rules above; convert date fields to epoch-ms.
2. Follow shared steps 1-6 (build payload, show it with the field changes spelled out, ask
   verbatim `Is it okay?`). Proceed only on `yes`.
3. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function updatePackage --payload-file <tmp.json> --yes
   ```

4. Report the result. A 400 "Cannot update invalid field(s)" / "Invalid ..." message means a
   field violated the rules above; fix and re-confirm with the user.
