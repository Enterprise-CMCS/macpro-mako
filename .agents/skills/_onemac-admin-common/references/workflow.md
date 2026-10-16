# OneMAC admin-change shared workflow

All `onemac-admin-*` skills follow these steps. The per-skill `SKILL.md` only adds the
function-specific payload and conflict handling.

## Context

These requests are almost always changes to the **production** stage. The three deployed
admin Lambdas are invoked directly (they are normally run by hand from the AWS console per
the [Admin Functions wiki](https://github.com/Enterprise-CMCS/macpro-mako/wiki/Admin-Functions)):

- `updatePackage` — actions `update-id`, `delete`, `recover`, `update-values`
- `submitNOSO`
- `submitSplitSPA`

Function name is `mako-<stage>-api-<function>` (default stage `production`, region `us-east-1`).
Direct-invoke payload is the full event: `{"body": { ... }}`. The handler returns an
API-Gateway shape `{ "statusCode": <n>, "body": "<json string>" }`.

## Steps

1. Resolve the Jira ticket key from the invocation. Read it with the Atlassian MCP tool
   `jira_get_issue` (fields `*all`, `include: comments`). Enterprise Jira lives at
   https://jiraent.cms.gov.
2. Extract the values this action needs (see the skill's "Inputs" section). Pull the package
   id(s), the CMS authorizer, and the reason from the description / acceptance criteria /
   comments. Treat these as **production** unless the ticket clearly says otherwise.
3. Ask the user for any missing required value. Do not guess ids, authorizers, dates, or
   statuses.
4. Build `changeMade` and `changeReason`:
   - `changeMade`: a short factual statement of the change.
   - `changeReason`: `This <change> was made per authorization from <CMS authorizer> because <reason>.`
   - If the authorizer or reason is not in the ticket, ask for it.
5. Write the payload to a temp JSON file as `{"body": { ... }}`.
6. Show the user the exact payload, the target function, the stage, and the resolved AWS
   profile. Then ask, verbatim:

   > Is it okay?

   Proceed only on an explicit `yes`. On `no` (or anything else), stop.

7. Invoke via the shared helper (it auto-selects `onemac-prod` when present, else the default
   profile, and runs an `aws sts get-caller-identity` pre-check):

   ```bash
   bash .agents/skills/_onemac-admin-common/scripts/invoke-admin-lambda.sh \
     --function <updatePackage|submitNOSO|submitSplitSPA> \
     --payload-file <tmp.json>
   # optional overrides: --stage <stage> --profile <name> --region <region>
   ```

8. Read the result:
   - `STATUS_CODE: 200` -> success. Report the `MESSAGE`.
   - Non-200 -> report the `MESSAGE`. If the skill defines conflict handling and a
     `MARKER:` line is present, follow that skill's delete-first flow.
9. For flows that finalize via SEATool (update-id, split-spa, NOSO), draft the ticket comment
   telling the help desk to **save the record in SEATool** to finish the sync, show it to the
   user, and post it only after they approve (standing rule: draft Jira comments for approval
   before posting).

## Helper exit codes and markers

- `0` success (200); `10` business error (non-200); `2` bad args; `3` not authenticated;
  `4` invoke transport failure; `5` unhandled Lambda error; `6` unparseable response.
- `MARKER: ID_ALREADY_EXISTS` — update-id target already exists.
- `MARKER: ALREADY_EXISTS` — generic "already exists" (e.g. NOSO against an OneMAC-origin id).

## Conflict handling (delete, wait for sink, retry)

A `delete` admin change **physically removes** the OpenSearch doc, so after the sink catches
up the id is no longer `found` and the original action succeeds. When a skill hits an
"already exists" collision:

1. Explain the collision and, verbatim, ask `Is it okay?` to delete the colliding id first.
2. On `yes`, invoke `updatePackage` with `action: delete` on the colliding id (same
   `changeMade`/`changeReason`).
3. Wait for the Kafka sink to process (retry the original action with a short backoff, e.g.
   a few attempts ~20-30s apart) until it stops returning the collision.
4. Re-run the original action.

## Safety

- Never run a production-changing invoke without showing the exact command/payload and getting
  the `Is it okay?` confirmation first.
- Do not post Jira comments or transition tickets without explicit approval of the draft.
- Do not hardcode or print AWS secrets; rely on the resolved profile's credentials.
