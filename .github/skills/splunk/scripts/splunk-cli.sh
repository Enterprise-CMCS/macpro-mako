#!/bin/bash
# Splunk CLI - bash wrapper
# Source this file:  source .github/skills/splunk/scripts/splunk-cli.sh

SPLUNK_CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

_splunk_py() {
    pip3 install -q requests 2>/dev/null
    python3 "$SPLUNK_CLI_DIR/splunk_cli.py" "$@"
}

splunk_login()            { _splunk_py login "$@"; }
splunk_status()           { _splunk_py status; }
splunk_logout()           { _splunk_py logout; }
splunk_whoami()           { _splunk_py whoami; }
splunk_info()             { _splunk_py info; }
splunk_list_indexes()     { _splunk_py list_indexes; }
splunk_list_apps()        { _splunk_py list_apps; }
splunk_search()           { _splunk_py search "$@"; }
splunk_job_results()      { _splunk_py job_results "$@"; }
splunk_job_status()       { _splunk_py job_status "$@"; }
splunk_list_jobs()        { _splunk_py list_jobs "$@"; }
splunk_quick_search()     { _splunk_py quick_search "$@"; }
splunk_oneshot()          { _splunk_py oneshot "$@"; }
splunk_list_savedsearches() { _splunk_py list_savedsearches; }
splunk_help()             { _splunk_py help; }

echo "✅ Splunk CLI functions loaded!"
echo "Run 'splunk_help' to see available commands"
