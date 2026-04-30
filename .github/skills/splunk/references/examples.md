# Splunk CLI Examples

## Basic Workflow

```bash
# Load the functions
source .github/skills/splunk/scripts/splunk-cli.sh

# Login
splunk_login

# Verify login
splunk_status

# List indexes
splunk_list_indexes
```

## Quick Searches

### Find recent errors

```bash
splunk_quick_search 'index=cloud cloudenv=dev source="/aws/lambda/mako-datasink-email-processEmails" level=error | head 20'
```

### Search for a known exception

```bash
splunk_quick_search 'index=cloud source="/aws/lambda/mako-datasink-email-processEmails" "SkippableValidationError" cloudenv="dev" | head 10'
```

### Search for withdrawal email confirmation

```bash
splunk_quick_search 'index=cloud source="/aws/lambda/mako-*" "Withdrawal Confirmation<div>" cloudenv=prod'
```

## Time-bounded Searches

### Search last 24 hours for 500s

```bash
splunk_search 'index=cloud source="/aws/lambda/mako-val-email-processEmails" status=500' '-24h' 'now'
```

### Search all Invocation Errors during a fixed date range

```bash
splunk_search 'index=cloud source="*mako*" "Invoke Error" cloudenv=impl' '2026-02-23T00:00:00' '2026-02-24T00:00:00'
```

## Job Workflow

```bash
# Create search job
splunk_search 'index=cloud | stats count by source' '-7d' 'now'

# Check completion
splunk_job_status 1234567890.12345

# Retrieve results
splunk_job_results 1234567890.12345
```

## Metadata Queries

```bash
splunk_whoami
splunk_info
splunk_list_indexes
splunk_list_apps
splunk_list_savedsearches
```
