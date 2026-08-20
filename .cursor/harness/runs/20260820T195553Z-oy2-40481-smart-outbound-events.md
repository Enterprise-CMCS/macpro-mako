# Run: oy2-40481-smart-outbound-events

- **started:** 2026-08-20T19:55:53Z
- **source:** `jira:OY2-40481` (related `jira:OY2-41233`)
- **execution requested:** no (PlanPacket only)
- **spec:** `.cursor/harness/specs/oy2-40481-smart-outbound-events.md`
- **PlanPacket:** `.cursor/harness/runs/20260820T195553Z-plan-packet.json`
- **topology:** hierarchical (T1→T7 sequential; T8–T10 and T11–T12 branch after T7; T13 after T12)

## Evidence consulted

- Jira [OY2-40481](https://jiraent.cms.gov/browse/OY2-40481), [OY2-41233](https://jiraent.cms.gov/browse/OY2-41233)
- Confluence [Medicaid SPA Outbound SMART→OneMAC](https://confluenceent.cms.gov/pages/viewpage.action?pageId=1381543870) (MSP Manual Record Created tab)
- User 2026-08-20: hide SMART packages; transform field names; no CDC emails; collision → new CloudWatch log stream only
- Harness: `~/.cursor/harness/learnings.md`, `verification-checklist.md`, `resource-manifest.md`
- Explorer [Kafka CDC ingest](6b768c98-9c78-4154-95ed-4fb1f0809732), [index hide and IDs](e7fa3495-989a-41c0-b215-59bafa1ff0e8)
- Docs researcher [Kafka and logs docs](3c38cf6d-86dc-4399-8152-1ce9ff0dc13c)
- Planner [Plan SMART ingest tasks](69066f07-1c88-46ce-a675-49cb31696f6d)

## Routing summary (inline; router Task not spawned)

| Task | Specialist | Tier | Model | Escalate |
| --- | --- | --- | --- | --- |
| T1 | explorer | cheap | composer-2.5-fast | no |
| T2, T4, T6, T8, T9, T11 | test_author | standard | gpt-5.6-sol-medium | no |
| T3, T5, T10, T13 | implementer | standard | gpt-5.6-sol-medium | no |
| T7, T12 | implementer | frontier | claude-opus-5-thinking-high | yes (risk=high) |

Roster slugs `claude-sonnet-5-thinking-high` and `claude-opus-4-8-thinking-xhigh` are not available on this Task harness. Planner used `claude-opus-5-thinking-high`; high-risk implementers use the same.

## Locked decisions worth flagging

- Dedicated `sinkSmart` Lambda + topic `aws.mulesoft.onemac.events` + standalone LATEST ESM. Do not share CDC/email processors.
- Lists already hide `origin: "SMART"` via `search.ts`. Reservation docs must set non-draft `seatoolStatus` so `itemExists` blocks ID reuse.
- Collision: log only, no overwrite. Offset reset requires a **new** consumer group.

## Still open (do not invent at execute time)

- U1 `seatoolStatus` value
- U2 hide SMART on package detail (`item.ts`) — planner recommends yes (T9/T10)
- U3 collision log group/stream names (proposal in spec)
- U8 derive `state` from `id`
- U11 keep SMART ESM off reindex `createTriggers`

## Next

Say `execute` (or `Use $harness-plan and execute tasks in specs/oy2-40481-smart-outbound-events.md`) to dispatch TDD → implement → independent verify. No commit/push in that phase unless asked separately.
