---
name: splunk
description: Search CMS Splunk Cloud logs using a local bash helper script. Use this skill when the user wants to authenticate to Splunk, inspect indexes, run ad hoc searches, troubleshoot application errors, or investigate applicaiton logs.
---

# Splunk CLI Skill

Use this skill when the user wants to work with CMS Splunk Cloud.

## Resources

- Script: `.github/skills/splunk/scripts/splunk-cli.sh`
- Human documentation: `.github/skills/splunk/README.md`
- Command reference: `.github/skills/splunk/references/commands.md`
- Examples: `.github/skills/splunk/references/examples.md`
- Troubleshooting: `.github/skills/splunk/references/troubleshooting.md`
- ECS source mappings: `.github/skills/splunk/references/source-mapping.md`

## Workflow

1. Source the helper script:

   ```bash
   source .github/skills/splunk/scripts/splunk-cli.sh
   ```

2. Check whether the user already has a valid session:

   ```bash
   splunk_status
   ```

3. If the user is not logged in, guide them through login:

   ```bash
   splunk_login
   ```

4. Choose the right action based on the request:
   - Use `splunk_quick_search` for short, interactive investigations.
   - Use `splunk_search` for larger or longer-running searches.
   - Use `splunk_job_status` and `splunk_job_results` for job-based workflows.
   - Use `splunk_list_indexes`, `splunk_list_apps`, or `splunk_whoami` for metadata and environment discovery.

5. Summarize findings and suggest follow-up searches if useful.

## Preferred commands

```bash
splunk_status
splunk_login
splunk_whoami
splunk_list_indexes
splunk_quick_search 'index=cloud | head 10'
splunk_search 'index=cloud error' '-1h' 'now'
splunk_job_status <sid>
splunk_job_results <sid>
```

## Guardrails

- Never ask the user to paste passwords into chat.
- Prefer interactive login with `splunk_login`.
- If commands return HTML instead of JSON, check `splunk_status` and re-authenticate.
- If a large query is requested, prefer the job workflow instead of `splunk_quick_search`.

## When to consult references

- Use `references/commands.md` for the full command catalog.
- Use `references/examples.md` for common search patterns.
- Use `references/troubleshooting.md` when authentication or queries fail.
- Use `references/source-mapping.md` when the user asks for ECS service source names.
