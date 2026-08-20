# Harness policy (macpro-mako)

Project overlay. Wins over `~/.cursor/harness/policy.md` and the base skill.

This directory is tracked in git (`.gitignore` un-ignores `.cursor/harness/`). Specs, PlanPackets, run notes, and this policy belong on a feature branch of `main` in this repository, not in a worktree and not only on the local machine.

## Durable artifact paths

Specs, PlanPackets, and run notes are shared. They must use repo-relative paths only.

Allowed:

- repo-relative: `.cursor/harness/specs/<slug>.md`, `lib/lambda/sinkMain.ts`
- public https URLs (Jira, Confluence, official docs)
- Jira keys and slugs: `jira:OY2-40481`

Forbidden:

- `/Users/...`, `/home/...`, `C:\...`, `file://`
- `git -C /absolute/repo` (run `git` from the repo root)
- markdown links whose target is a local absolute file

Task prompts may pass an absolute repo root so a subagent can locate the workspace. Do not copy that path into written artifacts.

Before writing a PlanPacket, scan for machine-local absolute paths and rewrite them. Do not write the packet if any remain.
