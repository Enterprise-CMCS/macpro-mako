# Splunk CLI Functions

A cross-platform CLI for interacting with Splunk Cloud via the REST API. Works on **macOS** and **Windows**. This tool provides simple commands for authentication, searching, and querying Splunk without needing direct server access.

## Why This Tool?

The standard Splunk CLI tools (`scloud`, `acs`) are designed for Splunk Cloud Platform (Victoria Experience) and don't work with all Splunk deployments. The CMS OIT Splunk cloud does not allow users to have personal access tokens (PATs). This CLI uses the web-based REST API authentication flow, which works with Splunk instances that expose a web interface. After login, session cookies are persisted in your system temp directory (`splunk_cookies.json`); because this file contains an authenticated session, protect it like a credential on shared machines.

## Prerequisites

- Python 3.7+ (`python3` on macOS, `python` on Windows)
- The `requests` library is installed automatically by the wrapper scripts

## Repository Location

This tool is packaged as a GitHub Copilot skill:

```
.github/skills/splunk/
```

Primary files:

```
.github/skills/splunk/scripts/splunk_cli.py     # Core implementation
.github/skills/splunk/scripts/splunk-cli.sh      # macOS/Linux wrapper
.github/skills/splunk/scripts/splunk-cli.ps1     # Windows wrapper
```

## Manual Loading

### macOS / Linux

```bash
source .github/skills/splunk/scripts/splunk-cli.sh
```

### Windows (PowerShell)

```powershell
. .github\skills\splunk\scripts\splunk-cli.ps1
```

### Verify Installation

```bash
splunk_help
```

## Configuration

The CLI is pre-configured for:

| Setting      | Value                            |
| ------------ | -------------------------------- |
| Splunk Host  | `https://splunk.cloud.cms.gov`   |
| Session File | `<temp dir>/splunk_cookies.json` |

To change the host, set the `SPLUNK_HOST` environment variable or edit `splunk_cli.py`.

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

- Sessions are stored in your system temp directory as `splunk_cookies.json`
- Sessions persist across terminal sessions until they expire
- If commands fail, re-run `splunk_login`

## Commands

See `references/commands.md` for the full command catalog.

## Examples

See `references/examples.md` for example searches and job workflows.

## Troubleshooting

See `references/troubleshooting.md` for common failures and fixes.

## Files

| File                                                  | Purpose                      |
| ----------------------------------------------------- | ---------------------------- |
| `.github/skills/splunk/SKILL.md`                      | Copilot skill instructions   |
| `.github/skills/splunk/scripts/README.md`             | Human-readable documentation |
| `.github/skills/splunk/scripts/splunk_cli.py`         | Core Python CLI              |
| `.github/skills/splunk/scripts/splunk-cli.sh`         | macOS/Linux wrapper          |
| `.github/skills/splunk/scripts/splunk-cli.ps1`        | Windows PowerShell wrapper   |
| `.github/skills/splunk/references/commands.md`        | Command reference            |
| `.github/skills/splunk/references/examples.md`        | Example searches             |
| `.github/skills/splunk/references/troubleshooting.md` | Troubleshooting guide        |
| `.github/skills/splunk/references/source-mapping.md`  | ECS source mappings          |
