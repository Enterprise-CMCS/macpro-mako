---
name: onemac-admin-submit-noso
description: Create a NOSO (Not Originally Submitted in OneMAC) package in production from a Jira ticket by invoking the submitNOSO Lambda, with the authority-to-mockEvent mapping and delete-first when an OneMAC-origin id already exists. Use when a Jira helpdesk ticket asks to manually add a SPA/waiver to OneMAC that already exists in SEATool/MMDL.
disable-model-invocation: true
---

# OneMAC admin: submit NOSO

Invokes `submitNOSO` to manually create a package that exists in SEATool/MMDL but not in OneMAC.
Unlike the other actions, this Lambda does NOT read an existing record — every required value
must be supplied, so gather them all from the ticket.

First read the shared workflow: [../\_onemac-admin-common/references/workflow.md](../_onemac-admin-common/references/workflow.md).

## Inputs (from the Jira ticket; ask if missing)

- `id` — the package id.
- `authority` — one of `1915(b)`, `1915(c)`, `CHIP SPA`, `Medicaid SPA` (drives `mockEvent`).
- `status` — SEATool status (e.g. `Submitted`).
- `submissionDate`, `proposedDate` — date strings (e.g. `01/01/2025 11:00:00 AM`, `02/20/2025`).
- `submitterEmail`, `submitterName` — optional.
- CMS authorizer and reason (for `changeReason`), and original submission channel for
  `changeMade` (email/MACPro/WMS/MMDL/etc.).

## authority -> mockEvent

- `1915(b)` (Waiver) -> `capitated-initial` (confirm the specific initial/renewal/amendment with
  the user if the ticket implies one; other valid values include `capitated-renewal`,
  `capitated-amendment`, `contracting-initial`, `contracting-renewal`, `contracting-amendment`,
  `temporary-extension`).
- `1915(c)` (App K) -> `app-k`.
- `CHIP SPA` -> `new-chip-submission`.
- `Medicaid SPA` -> `new-medicaid-submission`.
- MMDL-sourced packages use their authority's mapping (e.g. CHIP via `new-chip-submission`).

## Payload

```json
{
  "body": {
    "id": "<ID>",
    "authority": "<AUTHORITY>",
    "status": "<STATUS>",
    "submitterEmail": "<email or omit>",
    "submitterName": "<name or omit>",
    "submissionDate": "<MM/DD/YYYY hh:mm:ss AM>",
    "proposedDate": "<MM/DD/YYYY>",
    "adminChangeType": "NOSO",
    "mockEvent": "<mapped mockEvent>",
    "changeMade": "<ID> was manually added to OneMAC. Contact your CPOC to verify the initial submission documents.",
    "changeReason": "This package was added to OneMAC per authorization from <CMS authorizer>. Originally submitted through <channel>."
  }
}
```

## Steps

1. Gather all required inputs and map `authority` -> `mockEvent`. Ask the user for any gaps;
   do not guess dates, status, or authority.
2. Follow shared steps 1-6 (build payload, show it, ask verbatim `Is it okay?`). Proceed only on
   `yes`.
3. Invoke:

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function submitNOSO --payload-file <tmp.json> --yes
   ```

4. Interpret the result:
   - `STATUS_CODE: 200` -> submitted. Note: a NOSO can legitimately log a 404 internally while
     checking existence; rely on the returned `STATUS_CODE`/`MESSAGE`.
   - `MARKER: ALREADY_EXISTS` / message `Package with id: <ID> already exists.` -> an
     OneMAC-origin record already exists. Explain, ask verbatim `Is it okay?` to delete it first,
     then delete `<ID>` via `updatePackage` `action: delete`, wait for the sink, and re-run NOSO.
5. Draft the finalize comment for the ticket and post only after the user approves:

   > `<ID>` has been added to OneMAC. To complete the sync, please open the record in SEATool and
   > save it so the SEATool data is applied to the package.
