# Splunk CLI Functions

A bash-based CLI wrapper for interacting with Splunk Cloud via the REST API. This tool provides simple commands for authentication, searching, and querying Splunk without needing direct server access.

## Why This Tool?

The standard Splunk CLI tools (`scloud`, `acs`) are designed for Splunk Cloud Platform (Victoria Experience) and don't work with all Splunk deployments. This CLI uses the web-based REST API authentication flow, which works with Splunk instances that expose the web interface.

## Repository Location

This tool is packaged as a GitHub Copilot skill:

```bash
.github/skills/splunk/
```

Primary script:

```bash
.github/skills/splunk/scripts/splunk-cli.sh
```

## Manual Loading

If you want to use the script directly in a terminal:

```bash
source .github/skills/splunk/scripts/splunk-cli.sh
```

### Verify Installation

```bash
splunk_help
```

## Configuration

The CLI is pre-configured for:

| Setting | Value |
|---------|-------|
| Splunk Host | `https://splunk.cloud.cms.gov` |
| Session File | `/tmp/splunk_cookies.txt` |

To change the host, edit `.github/skills/splunk/scripts/splunk-cli.sh` and modify the `SPLUNK_HOST` variable.

## Authentication

### Login

You must login before using any other commands.

#### Fully Interactive

```bash
splunk_login
```

#### With Username

```bash
splunk_login myusername
```

> Password is always prompted interactively with hidden input so it does not appear in shell history.

### Check Login Status

```bash
splunk_status
```

### Logout

```bash
splunk_logout
```

### Session Persistence

- Sessions are stored in `/tmp/splunk_cookies.txt`
- Sessions persist across terminal sessions until they expire
- If commands fail, re-run `splunk_login`

## Commands

See `references/commands.md` for the full command catalog.

## Examples

See `references/examples.md` for example searches and job workflows.

## Troubleshooting

See `references/troubleshooting.md` for common failures and fixes.

## Files

| File                                                  | Purpose |
|-------------------------------------------------------|---------|
| `.github/skills/splunk/SKILL.md`                      | Copilot skill instructions |
| `.github/skills/splunk/scripts/README.md`             | Human-readable documentation |
| `.github/skills/splunk/scripts/splunk-cli.sh`         | Main CLI script |
| `.github/skills/splunk/references/commands.md`        | Command reference |
| `.github/skills/splunk/references/examples.md`        | Example searches |
| `.github/skills/splunk/references/troubleshooting.md` | Troubleshooting guide |
| `.github/skills/splunk/references/source-mapping.md`  | ECS source mappings |
