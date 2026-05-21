# Splunk CLI Command Reference

## Authentication

| Command                   | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `splunk_login [username]` | Login to Splunk, always prompting for password securely |
| `splunk_status`           | Check whether the current session is valid              |
| `splunk_logout`           | Clear the saved session                                 |
| `splunk_whoami`           | Show current user information                           |

## Information

| Command                     | Description                    |
| --------------------------- | ------------------------------ |
| `splunk_info`               | Show Splunk server information |
| `splunk_list_indexes`       | List available indexes         |
| `splunk_list_apps`          | List installed apps            |
| `splunk_list_savedsearches` | List saved searches            |

## Searching

| Command                                     | Description                                  |
| ------------------------------------------- | -------------------------------------------- |
| `splunk_search 'query' [earliest] [latest]` | Create a search job                          |
| `splunk_quick_search 'query'`               | Run search and automatically display results |
| `splunk_oneshot 'query'`                    | Run streaming export search                  |

## Search Jobs

| Command                    | Description                     |
| -------------------------- | ------------------------------- |
| `splunk_job_results <sid>` | Get results for a search job    |
| `splunk_job_status <sid>`  | Check whether a job is complete |
| `splunk_list_jobs [count]` | List recent jobs                |

## Advanced

| Command              | Description                             |
| -------------------- | --------------------------------------- |
| `splunk_curl <args>` | Direct curl to Splunk with auth cookies |

## Time Range Formats

| Format   | Example               | Description       |
| -------- | --------------------- | ----------------- |
| Relative | `-15m`                | 15 minutes ago    |
| Relative | `-1h`                 | 1 hour ago        |
| Relative | `-24h`                | 24 hours ago      |
| Relative | `-7d`                 | 7 days ago        |
| Absolute | `2026-02-23T15:00:00` | Specific datetime |
| Keyword  | `now`                 | Current time      |
