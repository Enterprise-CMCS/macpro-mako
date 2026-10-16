---
name: onemac-admin-delete-package
description: Delete (remove) a OneMAC package in production from a Jira ticket by invoking the updatePackage Lambda with action delete. Use when a Jira helpdesk ticket asks to delete or remove a package/SPA/waiver id from OneMAC.
disable-model-invocation: true
---

# OneMAC admin: delete package

Invokes `updatePackage` with `action: "delete"`. This physically removes the doc from the
OpenSearch main index and leaves a recoverable `<id>-del` copy.

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `packageId` — id to delete.
- CMS authorizer and reason (for `changeReason`).

## Payload

```json
{
  "body": {
    "packageId": "<ID>",
    "action": "delete",
    "changeMade": "<ID> deleted",
    "changeReason": "This package deletion was made per authorization from <CMS authorizer> because <reason>."
  }
}
```

## Steps

1. Follow shared steps 1-6 (extract id + authorizer/reason, build payload, show it, ask
   verbatim `Is it okay?`). Proceed only on `yes`.
2. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function updatePackage --payload-file <tmp.json> --yes
   ```

3. Report the result. `STATUS_CODE: 200` means deleted; a 404 message means the id was not
   found (check the id with the user). To undo, use the `onemac-admin-recover-package` skill
   with `<ID>-del`.
