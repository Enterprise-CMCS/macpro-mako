# Legacy Attachment Bucket Decommission Runbook

## Purpose
This runbook defines the future process for retiring legacy attachment buckets after runtime bucket remapping has been stable and validated. This document is intentionally generic and does not include account identifiers, ARNs, or concrete bucket names.

## Scope
- Applies to each environment independently (dev, val, production).
- Covers legacy source buckets and their mirrored destination buckets in the target account.
- Does not authorize immediate deletion; use only after readiness criteria are met.

## Preconditions
- Runtime remapping is deployed and active in the attachment download path.
- Bucket mapping parameter is configured in environment-specific Parameter Store.
- Full data copy validation has passed for each source/destination pair:
  - object count parity
  - total bytes parity
  - final sync dry-run reports zero pending changes
- Access logs and application logs are retained and queryable for the monitoring window.

## Readiness Criteria
All criteria below must be true before retirement begins:
1. No remap fallback events for the defined monitoring window.
2. No legacy-bucket direct-read events from application workloads for the defined monitoring window.
3. No operational tickets indicating missing attachments from migrated buckets.
4. Business owner approval recorded.
5. Platform/SRE approval recorded.
6. Security approval recorded.

## Monitoring Window
- Recommended window: 30 consecutive days per environment.
- Track at least:
  - count of remap-applied events
  - count of remap-fallback events
  - count of missing-map warnings
  - attachment download error rate
- Keep daily snapshots of these metrics for approval review.

## Approval Gates
Complete these gates in order:
1. Engineering gate: migration parity + runtime logs reviewed.
2. Product/Operations gate: no user-facing regressions reported.
3. Security/compliance gate: retention and legal-hold obligations confirmed.
4. Change-management gate: maintenance window and rollback owner assigned.

## Retirement Procedure (Future)
1. Freeze mapping changes for the environment.
2. Export final inventory from legacy and mirror buckets for audit records.
3. Re-run final parity validation and dry-run sync.
4. Apply read-only protection to legacy buckets (no delete yet).
5. Continue monitoring for one additional short soak window.
6. If clean, schedule retirement change.
7. Remove application permissions that are no longer required for legacy bucket access.
8. Archive all validation artifacts and approvals with timestamped evidence.

## Rollback Plan
If any attachment read failures or fallback spikes occur:
1. Re-enable previous access path for legacy buckets.
2. Restore temporary permissions required for recovery copy/sync.
3. Re-run targeted sync for missing keys.
4. Confirm attachment reads recover in logs and synthetic checks.
5. Pause retirement and reopen readiness review.

## Future Deletion Checklist (Do Not Execute Until Approved)
- [ ] Legal/compliance retention review complete.
- [ ] Incident review confirms no unresolved attachment-access issues.
- [ ] Final stakeholder sign-off completed.
- [ ] Final bucket inventory exported and stored in audit location.
- [ ] Object lock / retention settings reviewed and handled.
- [ ] Delete protection settings reviewed.
- [ ] Legacy bucket deletion executed in approved window.
- [ ] Post-delete monitoring confirms no regressions.

## Evidence to Retain
- Copy validation outputs (counts, bytes, dry-run results).
- CloudWatch or equivalent log queries showing remap behavior.
- Approval artifacts for all gates.
- Final inventory manifests and change records.
