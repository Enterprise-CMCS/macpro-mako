---
name: onemac-admin-recover-package
description: Recover a previously deleted OneMAC package in production from a Jira ticket by invoking the updatePackage Lambda with action recover. Use when a Jira helpdesk ticket asks to recover, restore, or undelete a package that was soft-deleted (its id ends with -del).
disable-model-invocation: true
---

# OneMAC admin: recover package

Invokes `updatePackage` with `action: "recover"`. Only works on a deleted package whose id ends
in `-del`; it republishes the original id with `deleted: false`.

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `packageId` — the deleted id **including the `-del` suffix** (e.g. `MD-9276.R00.01-del`). If
  the ticket gives the plain id, append `-del`.
- CMS authorizer and reason (for `changeReason`).

## Payload

```json
{
  "body": {
    "packageId": "<ID>-del",
    "action": "recover",
    "changeMade": "<ID> package was recovered",
    "changeReason": "This package recovery was made per authorization from <CMS authorizer> because <reason>."
  }
}
```

## Steps

1. Follow shared steps 1-6 (confirm the `-del` id + authorizer/reason, build payload, show it,
   ask verbatim `Is it okay?`). Proceed only on `yes`.
2. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function updatePackage --payload-file <tmp.json> --yes
   ```

3. Report the result. If the message says the package is not a deleted package, the id likely
   lacks the `-del` suffix or was never deleted; confirm with the user.
