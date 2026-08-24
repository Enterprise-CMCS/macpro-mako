# Run: oy2-40481-smart-outbound-events

- **started:** 2026-08-24T17:14:30Z
- **source:** `jira:OY2-40481` (related `jira:OY2-41233`)
- **execution requested:** yes
- **spec:** `.cursor/harness/specs/oy2-40481-smart-outbound-events.md`
- **PlanPacket:** `.cursor/harness/runs/20260824T171430Z-plan-packet.json`
- **topology:** hierarchical (T1→T6 sequential; T7, T8, T10 branch after T6; T9 after T8; T11 after T10; T12 after T7+T9+T11)

## Evidence consulted

- Jira [OY2-40481](https://jiraent.cms.gov/browse/OY2-40481) (In Progress), [OY2-41233](https://jiraent.cms.gov/browse/OY2-41233) (To Do)
- Confluence [Medicaid SPA Outbound SMART→OneMAC](https://confluenceent.cms.gov/pages/viewpage.action?pageId=1381543870) (page updated 2026-08-24; MSP Manual Record Created tab last update still 2026-08-17; payload unchanged)
- User 2026-08-20: hide SMART packages; transform field names; no CDC emails; collision → new CloudWatch log stream only
- Harness: learnings, verification-checklist, resource-manifest, project `policy.md`
- Explorer [Kafka CDC ingest](313cb919-0347-455a-b077-c3feeb4c6401), [index hide and IDs](ba7e5100-3014-46c2-b77f-c80465a210e4)
- Docs researcher [Kafka and logs docs](1e1a2c90-dfc8-42b4-929b-1cbb1d087cad)
- Planner [Plan SMART ingest tasks](b4bd9bb2-ad1f-4f49-93e7-ca145a35f878)
- Prior packet `.cursor/harness/runs/20260820T195553Z-plan-packet.json` (superseded as execution baseline)

## Routing summary (inline; router Task not spawned)

| Task                    | Specialist  | Tier     | Model                       | Escalate        |
| ----------------------- | ----------- | -------- | --------------------------- | --------------- |
| T1, T3, T5, T7, T8, T10 | test_author | standard | gpt-5.6-sol-medium          | no              |
| T2, T4, T9, T12         | implementer | standard | gpt-5.6-sol-medium          | no              |
| T6, T11                 | implementer | frontier | claude-opus-5-thinking-high | yes (risk=high) |

Roster slugs `claude-sonnet-5-thinking-high` and `claude-opus-4-8-thinking-xhigh` are not available on this Task harness. High-risk implementers use `claude-opus-5-thinking-high`.

## Locked decisions worth flagging

- Dedicated `sinkSmart` Lambda + topic `aws.mulesoft.onemac.events` + standalone LATEST ESM. Do not share CDC/email processors.
- Lists already hide `origin: "SMART"` via `search.ts`. Reservation docs must set non-draft `seatoolStatus` so `itemExists` blocks ID reuse.
- Working U1 default: `SEATOOL_STATUS.SUBMITTED` (unconfirmed).
- Collision: log only, no overwrite. Offset reset requires a **new** consumer group.

## Still open (do not invent at execute time)

- U1 reservation `seatoolStatus` (working default SUBMITTED)
- U2 hide SMART on package detail (`item.ts`) — planner recommends yes (T8/T9)
- U3 collision log group/stream names (proposal in spec)
- U8 derive `state` from `id` (working default `id.toUpperCase().slice(0, 2)`)
- U11 keep SMART ESM off reindex `createTriggers`

## Execution

Completed T1–T12 (TDD → implement → independent verify). No commit/push. Reviewer and ship were not run.

| Task | Result                                                                                   |
| ---- | ---------------------------------------------------------------------------------------- |
| T1   | pass (red: missing `sinkSmart`)                                                          |
| T2   | pass after prettier critic round; repo-wide `test-tsc` is pre-existing fail              |
| T3   | pass (red: missing transform)                                                            |
| T4   | pass after return-type/`ItemResult` critic round                                         |
| T5   | pass (red: missing reservation writer)                                                   |
| T6   | pass                                                                                     |
| T7   | pass (regression tests; no production changes to itemExists/search/checkIdentifierUsage) |
| T8   | pass (red: SMART detail hide)                                                            |
| T9   | pass after `packageResult?` critic round                                                 |
| T10  | pass (red: missing CDK resources)                                                        |
| T11  | pass                                                                                     |
| T12  | pass                                                                                     |

Still open: U1, U2, U3, U8, U11. Confirm before production rollout.
