# checkIdentifierUsage Endpoint Testing Guide (Ephemeral `datasink`)

## Purpose
This document is a testing guideline for the public `GET /checkIdentifierUsage` endpoint in the OneMAC `datasink` environment.

It explains:
- How the endpoint is intended to be used.
- What it returns.
- What it does not return.

This guide is written to support public endpoint review and approval.

## What This Endpoint Does
- Checks whether a submitted identifier is already in use.
- Returns a minimal response:
  - `inUse: true|false`
  - optional `system` string when in use
- Supports simple `GET` requests with one query parameter: `id`.

## What This Endpoint Does Not Return
- No person-level data (no names, no emails, no phone numbers).
- No protected health information (PHI) or other sensitive case details.
- No submission payload contents, forms, attachments, or document metadata.
- No authentication/session data.

The response is intentionally limited to uniqueness status plus the source system label (when found).

## Endpoint Summary
- Method: `GET`
- Path: `/checkIdentifierUsage`
- Full URL pattern: `{BASE_URL}/checkIdentifierUsage?id={identifier}`
- Authentication: none
- Required query parameter:
  - `id` (string)

## Response Contract
- `200 OK` (identifier is available):

```json
{"inUse":false}
```

- `200 OK` (identifier already exists):

```json
{"inUse":true,"system":"OneMAC"}
```

- `400 Bad Request` (missing or empty `id`):

```json
{"message":"Missing required parameter: id"}
```

- `500 Internal Server Error`:

```json
{"message":"Internal server error"}
```

## Base URL (`datasink`)

```bash
BASE_URL="https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink"
ENDPOINT="$BASE_URL/checkIdentifierUsage"
```

## Easy Browser Test (Non-Technical)
Use these URLs directly in a browser address bar. The browser should display a JSON response.

1. In-use example (should return `inUse:true`):
   - [https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=MD-25-9296](https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=MD-25-9296)
2. Not in-use example (should return `inUse:false`):
   - [https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=XX-99999-NONEXISTENT](https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=XX-99999-NONEXISTENT)
3. Missing required parameter example (should return `400` message):
   - [https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage](https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage)

## Browser URLs (quick checks)
- In use (expected `inUse:true`):
  - `https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=MD-25-9296`
- Not in use (expected `inUse:false`):
  - `https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=XX-99999-NONEXISTENT`
- Missing `id` (expected `400`):
  - `https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage`

## Copy/Paste curl Commands

### Direct full-URL examples

#### In-use (`inUse:true`)

```bash
curl -sS "https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=MD-25-9296"
```

Expected response:

```json
{"inUse":true,"system":"OneMAC"}
```

#### Not in-use (`inUse:false`)

```bash
curl -sS "https://spk1jmd0r9.execute-api.us-east-1.amazonaws.com/datasink/checkIdentifierUsage?id=XX-99999-NONEXISTENT"
```

Expected response:

```json
{"inUse":false}
```

### Using `BASE_URL`/`ENDPOINT` variables

### 1) In-use ID (expect `inUse:true`)

```bash
curl -sS "$ENDPOINT?id=MD-25-9296"
```

Expected response:

```json
{"inUse":true,"system":"OneMAC"}
```

### 2) Not in-use ID (expect `inUse:false`)

```bash
curl -sS "$ENDPOINT?id=XX-99999-NONEXISTENT"
```

Expected response:

```json
{"inUse":false}
```

### 3) Missing `id` (expect `400`)

```bash
curl -sS -i "$ENDPOINT"
```

Expected body:

```json
{"message":"Missing required parameter: id"}
```

### 4) Empty `id` (expect `400`)

```bash
curl -sS -i "$ENDPOINT?id="
```

Expected body:

```json
{"message":"Missing required parameter: id"}
```

### 5) URL-encoded ID (expect `200`)

```bash
curl -sS "$ENDPOINT?id=AL-25-9109-PFXC"
```

Expected response:

```json
{"inUse":true,"system":"OneMAC"}
```

### 6) Extra query parameters ignored (expect `200`)

```bash
curl -sS "$ENDPOINT?id=XX-99999-NONEXISTENT&foo=bar&x=1"
```

Expected response:

```json
{"inUse":false}
```

### 7) OPTIONS preflight / CORS (expect `204`)

```bash
curl -sS -i -X OPTIONS "$ENDPOINT" \
  -H 'Origin: https://example.com' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

Expected headers include:
- `access-control-allow-origin: *`
- `access-control-allow-methods: OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD`

## Known In-use IDs for `datasink`
These IDs are expected to return `inUse:true`:
- `MD-25-9296` (`OneMAC`)
- `MD-25-9167` (`OneMAC`)
- `AL-25-9017` (`OneMAC`)
- `AL-25-9109-PFXC` (`OneMAC`)
- `MD-2260.R00.10` (`OneMAC`)
- `AL.22.R22.M22` (`OneMACLegacy`)

## Test Scenarios Checklist
1. Required parameter validation (`id` missing/empty).
2. In-use lookup returns `inUse:true` and `system`.
3. Not in-use lookup returns `inUse:false`.
4. Case-insensitive lookup behavior (e.g. lowercase known ID).
5. Query handling (extra params ignored).
6. CORS preflight behavior (`OPTIONS`).

## Troubleshooting
- If a known in-use ID returns `inUse:false`, verify that the latest endpoint fix is deployed to `datasink`.
- If you get `400` with `Missing required parameter: id`, pass a non-empty `id` query parameter.
- If testing a different stage, set the stage-specific base URL and rerun the same commands.
- For IDs shown in this guide, URL encoding is not required.
