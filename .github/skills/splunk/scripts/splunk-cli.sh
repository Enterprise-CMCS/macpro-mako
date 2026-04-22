#!/bin/bash
# Splunk REST API CLI Functions
# Source this file:
#   source .github/skills/splunk/scripts/splunk-cli.sh

# Configuration
SPLUNK_HOST="https://splunk.cloud.cms.gov"
SPLUNK_COOKIES="/tmp/splunk_cookies.txt"

# Login to Splunk
# Usage: splunk_login           (interactive - prompts for both)
#        splunk_login username  (prompts for password securely)
splunk_login() {
    local username="$1"
    local password=""
    
    if [ -z "$username" ]; then
        echo -n "Username: "
        read username
    fi
    
    echo -n "Password: "
    read -s password
    echo ""
    
    echo "Authenticating with Splunk..."
    
    local csrf_response=$(curl -k -c "$SPLUNK_COOKIES" -s \
        "${SPLUNK_HOST}/en-US/account/login" 2>/dev/null)
    
    local cval=$(grep -o 'cval.*[0-9]*' "$SPLUNK_COOKIES" 2>/dev/null | head -1 | grep -o '[0-9]*$')
    
    if [ -z "$cval" ]; then
        cval=$(echo "$csrf_response" | grep -o '"cval":[0-9]*' | grep -o '[0-9]*' | head -1)
    fi
    
    if [ -z "$cval" ]; then
        echo "❌ Failed to get CSRF token"
        return 1
    fi
    
    local login_response=$(curl -k -X POST "${SPLUNK_HOST}/en-US/account/login" \
        -c "$SPLUNK_COOKIES" \
        -b "$SPLUNK_COOKIES" \
        -d "cval=${cval}" \
        -d "username=${username}" \
        -d "password=${password}" \
        -d "set_has_logged_in=false" \
        -s 2>/dev/null)
    
    local verify=$(curl -k -b "$SPLUNK_COOKIES" -s \
        "${SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context?output_mode=json" 2>/dev/null)
    
    if echo "$verify" | grep -q '"username"'; then
        local logged_in_user=$(echo "$verify" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        local real_name=$(echo "$verify" | grep -o '"realname":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Login successful!"
        echo "   Username: $logged_in_user"
        echo "   Name: $real_name"
        echo "   Session saved to: $SPLUNK_COOKIES"
        return 0
    else
        echo "❌ Login failed. Please check your credentials."
        return 1
    fi
}

splunk_status() {
    if [ ! -f "$SPLUNK_COOKIES" ]; then
        echo "❌ Not logged in (no session file found)"
        echo "   Run: splunk_login"
        return 1
    fi
    
    local verify=$(curl -k -b "$SPLUNK_COOKIES" -s \
        "${SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context?output_mode=json" 2>/dev/null)
    
    if echo "$verify" | grep -q '"username"'; then
        local logged_in_user=$(echo "$verify" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        local real_name=$(echo "$verify" | grep -o '"realname":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Logged in as: $logged_in_user ($real_name)"
        return 0
    else
        echo "❌ Session expired or invalid"
        echo "   Run: splunk_login"
        return 1
    fi
}

splunk_logout() {
    if [ -f "$SPLUNK_COOKIES" ]; then
        rm -f "$SPLUNK_COOKIES"
        echo "✅ Logged out (session cleared)"
    else
        echo "Already logged out"
    fi
}

splunk_get_csrf() {
    grep "splunkweb_csrf" "$SPLUNK_COOKIES" 2>/dev/null | awk '{print $NF}'
}

splunk_curl() {
    curl -k -b "$SPLUNK_COOKIES" "$@"
}

splunk_search() {
    local query="$1"
    local earliest="${2:--1h}"
    local latest="${3:-now}"
    
    if [ -z "$query" ]; then
        echo "Usage: splunk_search 'search query' [earliest_time] [latest_time]"
        echo "Example: splunk_search 'index=cloud error' '-1h' 'now'"
        return 1
    fi
    
    local csrf_token=$(splunk_get_csrf)
    if [ -z "$csrf_token" ]; then
        echo "Error: No CSRF token found. Please login first with splunk_login"
        return 1
    fi
    
    echo "Starting search: $query"
    local response=$(curl -k -b "$SPLUNK_COOKIES" \
        -H "X-Splunk-Form-Key: $csrf_token" \
        -H "X-Requested-With: XMLHttpRequest" \
        -X POST "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs?output_mode=json" \
        -d "search=search $query" \
        -d "earliest_time=$earliest" \
        -d "latest_time=$latest" 2>/dev/null)
    
    local job_sid=$(echo "$response" | grep -o '"sid":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$job_sid" ]; then
        echo "Job created: $job_sid"
        echo "Run: splunk_job_results $job_sid"
        echo "$job_sid"
    else
        echo "Failed to create search job"
        echo "Response: $response"
        return 1
    fi
}

splunk_job_results() {
    local job_sid="$1"
    local output_mode="${2:-json}"
    
    if [ -z "$job_sid" ]; then
        echo "Usage: splunk_job_results <job_sid> [output_mode]"
        echo "Example: splunk_job_results 1234567890.12345"
        return 1
    fi
    
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/${job_sid}/results?output_mode=${output_mode}" 2>/dev/null
}

splunk_job_status() {
    local job_sid="$1"
    
    if [ -z "$job_sid" ]; then
        echo "Usage: splunk_job_status <job_sid>"
        return 1
    fi
    
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/${job_sid}?output_mode=json" 2>/dev/null | \
        grep -o '"isDone":[^,]*' | head -1
}

splunk_list_jobs() {
    local count="${1:-10}"
    
    echo "Recent search jobs:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs?output_mode=json&count=${count}" 2>/dev/null | \
        python3 -m json.tool 2>/dev/null || splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs?output_mode=json&count=${count}" 2>/dev/null
}

splunk_list_indexes() {
    echo "Available indexes:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/data/indexes?output_mode=json" 2>/dev/null | \
        grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort
}

splunk_info() {
    echo "Splunk Server Information:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/server/info?output_mode=json" 2>/dev/null | \
        python3 -m json.tool 2>/dev/null || splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/server/info?output_mode=json" 2>/dev/null
}

splunk_whoami() {
    echo "Current user information:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context?output_mode=json" 2>/dev/null | \
        python3 -c "import sys, json; data=json.load(sys.stdin); entry=data['entry'][0]['content']; print(f\"Username: {entry['username']}\\nReal Name: {entry['realname']}\\nEmail: {entry['email']}\\nRoles: {', '.join(entry['roles'][:5])}...\")" 2>/dev/null || \
        splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context?output_mode=json" 2>/dev/null
}

splunk_list_apps() {
    echo "Installed apps:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/apps/local?output_mode=json" 2>/dev/null | \
        grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort
}

splunk_quick_search() {
    local query="$1"
    
    if [ -z "$query" ]; then
        echo "Usage: splunk_quick_search 'search query'"
        echo "Example: splunk_quick_search 'index=cloud | head 10'"
        return 1
    fi
    
    echo "Running quick search (results may take a moment)..."
    local job_sid=$(splunk_search "$query" "-15m" "now")
    
    if [ -n "$job_sid" ]; then
        sleep 3
        echo ""
        echo "Results:"
        splunk_job_results "$job_sid" "json" | python3 -m json.tool 2>/dev/null | head -50
    fi
}

splunk_oneshot() {
    local query="$1"
    
    if [ -z "$query" ]; then
        echo "Usage: splunk_oneshot 'search query'"
        echo "Example: splunk_oneshot 'index=cloud | head 5'"
        return 1
    fi
    
    local csrf_token=$(splunk_get_csrf)
    if [ -z "$csrf_token" ]; then
        echo "Error: No CSRF token found. Please login first with splunk_login"
        return 1
    fi
    
    curl -k -b "$SPLUNK_COOKIES" \
        -H "X-Splunk-Form-Key: $csrf_token" \
        -H "X-Requested-With: XMLHttpRequest" \
        -X POST "${SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/export?output_mode=json" \
        -d "search=search $query" \
        -d "earliest_time=-1h" \
        -d "latest_time=now" 2>/dev/null
}

splunk_list_savedsearches() {
    echo "Saved searches:"
    splunk_curl "${SPLUNK_HOST}/en-US/splunkd/__raw/services/saved/searches?output_mode=json" 2>/dev/null | \
        grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort
}

splunk_help() {
    cat << 'EOH'
Splunk REST API CLI Functions
==============================

Authentication Commands:
  splunk_login [username]          - Login to Splunk (password always prompted securely)
  splunk_status                    - Check current login status
  splunk_logout                    - Clear session and logout

Query Commands:
  splunk_whoami                    - Show current user info
  splunk_info                      - Show Splunk server information
  splunk_list_indexes              - List all available indexes
  splunk_list_apps                 - List installed apps
  splunk_search 'query' [earliest] [latest]
                                   - Create a search job
  splunk_quick_search 'query'      - Run search and show results automatically
  splunk_oneshot 'query'           - Run quick export search (streaming)
  splunk_job_results <job_sid>     - Get results for a search job
  splunk_job_status <job_sid>      - Check if search job is complete
  splunk_list_jobs [count]         - List recent search jobs
  splunk_list_savedsearches        - List saved searches
  splunk_curl <url>                - Direct curl to Splunk with auth

Time Modifiers:
  -15m, -1h, -24h, -7d             - Relative time
  now                              - Current time
  YYYY-MM-DDTHH:MM:SS              - Absolute time

Quick Start:
  1. splunk_login
  2. splunk_status
  3. splunk_list_indexes
  4. splunk_quick_search 'index=cloud | head 10'
EOH
}

echo "✅ Splunk CLI functions loaded!"
echo "Run 'splunk_help' to see available commands"
