#!/usr/bin/env python3
"""Splunk REST API CLI - Cross-platform Splunk Cloud helper."""

import sys
import os
import json
import getpass
import tempfile
import re
import time
from pathlib import Path

import requests
import urllib3

# Suppress InsecureRequestWarning for self-signed certs
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

SPLUNK_HOST = os.environ.get("SPLUNK_HOST", "https://splunk.cloud.cms.gov")
COOKIE_FILE = Path(tempfile.gettempdir()) / "splunk_cookies.json"


def _save_cookies(session):
    cookies = requests.utils.dict_from_cookiejar(session.cookies)
    COOKIE_FILE.write_text(json.dumps(cookies))


def _load_cookies(session):
    if COOKIE_FILE.exists():
        cookies = json.loads(COOKIE_FILE.read_text())
        session.cookies.update(cookies)


def _session():
    s = requests.Session()
    s.verify = False
    _load_cookies(s)
    return s


def _get_csrf(session):
    cookies = requests.utils.dict_from_cookiejar(session.cookies)
    return cookies.get("splunkweb_csrf_token_8000") or cookies.get("splunkweb_csrf_token")


def login(args):
    username = args[0] if args else input("Username: ")
    password = getpass.getpass("Password: ")

    print("Authenticating with Splunk...")
    session = requests.Session()
    session.verify = False

    # Get CSRF token from login page
    session.get(f"{SPLUNK_HOST}/en-US/account/login")
    cookies = requests.utils.dict_from_cookiejar(session.cookies)
    cval = None
    for key, val in cookies.items():
        if "cval" in key:
            cval = val
            break

    if not cval:
        print("❌ Failed to get CSRF token")
        return 1

    # Login
    session.post(f"{SPLUNK_HOST}/en-US/account/login", data={
        "cval": cval,
        "username": username,
        "password": password,
        "set_has_logged_in": "false",
    })

    # Verify
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context",
        params={"output_mode": "json"},
    )

    try:
        data = resp.json()
        entry = data["entry"][0]["content"]
        print(f"✅ Login successful!")
        print(f"   Username: {entry['username']}")
        print(f"   Name: {entry['realname']}")
        print(f"   Session saved to: {COOKIE_FILE}")
        _save_cookies(session)
        return 0
    except Exception:
        print("❌ Login failed. Please check your credentials.")
        return 1


def status(_args):
    session = _session()
    if not COOKIE_FILE.exists():
        print("❌ Not logged in (no session file found)")
        print("   Run: splunk_login")
        return 1

    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context",
        params={"output_mode": "json"},
    )
    try:
        data = resp.json()
        entry = data["entry"][0]["content"]
        print(f"✅ Logged in as: {entry['username']} ({entry['realname']})")
        return 0
    except Exception:
        print("❌ Session expired or invalid")
        print("   Run: splunk_login")
        return 1


def logout(_args):
    if COOKIE_FILE.exists():
        COOKIE_FILE.unlink()
        print("✅ Logged out (session cleared)")
    else:
        print("Already logged out")
    return 0


def whoami(_args):
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/authentication/current-context",
        params={"output_mode": "json"},
    )
    try:
        data = resp.json()
        entry = data["entry"][0]["content"]
        roles = ", ".join(entry["roles"][:5])
        print("Current user information:")
        print(f"  Username: {entry['username']}")
        print(f"  Real Name: {entry['realname']}")
        print(f"  Email: {entry['email']}")
        print(f"  Roles: {roles}...")
        return 0
    except Exception:
        print(resp.text)
        return 1


def info(_args):
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/server/info",
        params={"output_mode": "json"},
    )
    print("Splunk Server Information:")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    return 0


def list_indexes(_args):
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/data/indexes",
        params={"output_mode": "json"},
    )
    print("Available indexes:")
    try:
        data = resp.json()
        names = sorted(e["name"] for e in data.get("entry", []))
        for name in names:
            print(f"  {name}")
    except Exception:
        # Fallback: extract names with regex
        for m in sorted(set(re.findall(r'"name":"([^"]*)"', resp.text))):
            print(f"  {m}")
    return 0


def list_apps(_args):
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/apps/local",
        params={"output_mode": "json"},
    )
    print("Installed apps:")
    try:
        data = resp.json()
        names = sorted(e["name"] for e in data.get("entry", []))
        for name in names:
            print(f"  {name}")
    except Exception:
        for m in sorted(set(re.findall(r'"name":"([^"]*)"', resp.text))):
            print(f"  {m}")
    return 0


def search(args):
    if not args:
        print("Usage: splunk_search 'search query' [earliest_time] [latest_time]")
        print("Example: splunk_search 'index=cloud error' '-1h' 'now'")
        return 1

    query = args[0]
    earliest = args[1] if len(args) > 1 else "-1h"
    latest = args[2] if len(args) > 2 else "now"

    session = _session()
    csrf_token = _get_csrf(session)
    if not csrf_token:
        print("Error: No CSRF token found. Please login first with splunk_login")
        return 1

    print(f"Starting search: {query}")
    resp = session.post(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs",
        params={"output_mode": "json"},
        headers={
            "X-Splunk-Form-Key": csrf_token,
            "X-Requested-With": "XMLHttpRequest",
        },
        data={
            "search": f"search {query}",
            "earliest_time": earliest,
            "latest_time": latest,
        },
    )

    try:
        data = resp.json()
        sid = data.get("sid")
        if sid:
            print(f"Job created: {sid}")
            print(f"Run: splunk_job_results {sid}")
            print(sid)
            return 0
    except Exception:
        pass

    print("Failed to create search job")
    print(f"Response: {resp.text}")
    return 1


def job_results(args):
    if not args:
        print("Usage: splunk_job_results <job_sid> [output_mode]")
        print("Example: splunk_job_results 1234567890.12345")
        return 1

    sid = args[0]
    output_mode = args[1] if len(args) > 1 else "json"

    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/{sid}/results",
        params={"output_mode": output_mode},
    )
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    return 0


def job_status(args):
    if not args:
        print("Usage: splunk_job_status <job_sid>")
        return 1

    sid = args[0]
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/{sid}",
        params={"output_mode": "json"},
    )
    try:
        data = resp.json()
        is_done = data["entry"][0]["content"]["isDone"]
        print(f'"isDone":{str(is_done).lower()}')
    except Exception:
        print(resp.text)
    return 0


def list_jobs(args):
    count = args[0] if args else "10"
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs",
        params={"output_mode": "json", "count": count},
    )
    print("Recent search jobs:")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    return 0


def quick_search(args):
    if not args:
        print("Usage: splunk_quick_search 'search query'")
        print("Example: splunk_quick_search 'index=cloud | head 10'")
        return 1

    query = args[0]
    print("Running quick search (results may take a moment)...")

    # Create the job
    session = _session()
    csrf_token = _get_csrf(session)
    if not csrf_token:
        print("Error: No CSRF token found. Please login first with splunk_login")
        return 1

    resp = session.post(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs",
        params={"output_mode": "json"},
        headers={
            "X-Splunk-Form-Key": csrf_token,
            "X-Requested-With": "XMLHttpRequest",
        },
        data={
            "search": f"search {query}",
            "earliest_time": "-15m",
            "latest_time": "now",
        },
    )

    try:
        sid = resp.json().get("sid")
    except Exception:
        print("Failed to create search job")
        return 1

    if not sid:
        print("Failed to create search job")
        return 1

    print(f"Job created: {sid}")
    time.sleep(3)

    # Fetch results
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/{sid}/results",
        params={"output_mode": "json"},
    )
    print("\nResults:")
    try:
        data = resp.json()
        # Print first ~50 lines worth
        output = json.dumps(data, indent=2)
        lines = output.split("\n")
        print("\n".join(lines[:50]))
        if len(lines) > 50:
            print(f"... ({len(lines) - 50} more lines)")
    except Exception:
        print(resp.text[:2000])
    return 0


def oneshot(args):
    if not args:
        print("Usage: splunk_oneshot 'search query'")
        print("Example: splunk_oneshot 'index=cloud | head 5'")
        return 1

    query = args[0]
    session = _session()
    csrf_token = _get_csrf(session)
    if not csrf_token:
        print("Error: No CSRF token found. Please login first with splunk_login")
        return 1

    resp = session.post(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/search/jobs/export",
        params={"output_mode": "json"},
        headers={
            "X-Splunk-Form-Key": csrf_token,
            "X-Requested-With": "XMLHttpRequest",
        },
        data={
            "search": f"search {query}",
            "earliest_time": "-1h",
            "latest_time": "now",
        },
    )
    print(resp.text)
    return 0


def list_savedsearches(_args):
    session = _session()
    resp = session.get(
        f"{SPLUNK_HOST}/en-US/splunkd/__raw/services/saved/searches",
        params={"output_mode": "json"},
    )
    print("Saved searches:")
    try:
        data = resp.json()
        names = sorted(e["name"] for e in data.get("entry", []))
        for name in names:
            print(f"  {name}")
    except Exception:
        for m in sorted(set(re.findall(r'"name":"([^"]*)"', resp.text))):
            print(f"  {m}")
    return 0


def help_cmd(_args):
    print("""Splunk REST API CLI
==============================

Authentication Commands:
  login [username]                 - Login to Splunk (password always prompted securely)
  status                           - Check current login status
  logout                           - Clear session and logout

Query Commands:
  whoami                           - Show current user info
  info                             - Show Splunk server information
  list_indexes                     - List all available indexes
  list_apps                        - List installed apps
  search 'query' [earliest] [latest]
                                   - Create a search job
  quick_search 'query'             - Run search and show results automatically
  oneshot 'query'                  - Run quick export search (streaming)
  job_results <job_sid>            - Get results for a search job
  job_status <job_sid>             - Check if search job is complete
  list_jobs [count]                - List recent search jobs
  list_savedsearches               - List saved searches

Time Modifiers:
  -15m, -1h, -24h, -7d            - Relative time
  now                              - Current time
  YYYY-MM-DDTHH:MM:SS             - Absolute time

Quick Start:
  1. splunk_login
  2. splunk_status
  3. splunk_list_indexes
  4. splunk_quick_search 'index=cloud | head 10'""")
    return 0


COMMANDS = {
    "login": login,
    "status": status,
    "logout": logout,
    "whoami": whoami,
    "info": info,
    "list_indexes": list_indexes,
    "list_apps": list_apps,
    "search": search,
    "job_results": job_results,
    "job_status": job_status,
    "list_jobs": list_jobs,
    "quick_search": quick_search,
    "oneshot": oneshot,
    "list_savedsearches": list_savedsearches,
    "help": help_cmd,
}


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print("Usage: splunk_cli.py <command> [args...]")
        print(f"Commands: {', '.join(COMMANDS.keys())}")
        sys.exit(1)

    cmd = sys.argv[1]
    rc = COMMANDS[cmd](sys.argv[2:])
    sys.exit(rc or 0)
