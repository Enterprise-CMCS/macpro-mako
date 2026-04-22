# Troubleshooting

## Network Connectivity
Symptoms:
> It looks like the Splunk search failed. Let me try a different approach - perhaps there's an authentication issue or the search syntax needs to be adjusted.

Fix: 
 Make sure you are connected to VPN (via Zscaler)


## Missing CSRF token

If login fails because the script cannot obtain a CSRF token:

- Verify the Splunk host is correct
- Verify the login page is reachable
- Retry authentication
- Check whether the deployment changed its login behavior

## Missing Dependencies
###  `curl` or `python3` not found

Install the missing dependency, then retry:

- `curl` is required for API calls
- `python3` is used for pretty-printing some JSON responses

## Session expired or invalid

Symptoms:

- `splunk_status` reports that the session is expired or invalid
- Searches return login pages or HTML

Fix:

```bash
splunk_status
splunk_login
```

## Commands return HTML instead of JSON

This usually means authentication failed or the session expired.

Recommended steps:

1. Check login status:

   ```bash
   splunk_status
   ```

2. Re-authenticate:

   ```bash
   splunk_login
   ```

## Failed to create search job

Possible causes:

- Session expired
- Query syntax issue
- Missing permissions
- Invalid index or source

Recommended steps:

```bash
splunk_status
splunk_list_indexes
```

Then retry with a simpler query such as:

```bash
splunk_quick_search 'index=cloud | head 5'
```

## Permission denied on certain indexes

Your Splunk account may not have access to all indexes.

Check accessible indexes:

```bash
splunk_list_indexes
```
