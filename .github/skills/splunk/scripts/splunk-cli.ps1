# Splunk CLI - PowerShell wrapper
# Dot-source this file:  . .github\skills\splunk\scripts\splunk-cli.ps1

$SplunkCliDir = $PSScriptRoot

function _splunk_py {
    pip install -q requests 2>$null
    python "$SplunkCliDir/splunk_cli.py" @args
}

function splunk_login            { _splunk_py login @args }
function splunk_status           { _splunk_py status }
function splunk_logout           { _splunk_py logout }
function splunk_whoami           { _splunk_py whoami }
function splunk_info             { _splunk_py info }
function splunk_list_indexes     { _splunk_py list_indexes }
function splunk_list_apps        { _splunk_py list_apps }
function splunk_search           { _splunk_py search @args }
function splunk_job_results      { _splunk_py job_results @args }
function splunk_job_status       { _splunk_py job_status @args }
function splunk_list_jobs        { _splunk_py list_jobs @args }
function splunk_quick_search     { _splunk_py quick_search @args }
function splunk_oneshot          { _splunk_py oneshot @args }
function splunk_list_savedsearches { _splunk_py list_savedsearches }
function splunk_help             { _splunk_py help }

Write-Host "✅ Splunk CLI functions loaded!"
Write-Host "Run 'splunk_help' to see available commands"
