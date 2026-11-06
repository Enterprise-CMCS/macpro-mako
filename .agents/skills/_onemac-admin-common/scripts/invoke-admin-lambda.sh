#!/usr/bin/env bash
#
# invoke-admin-lambda.sh
# Invoke a OneMAC admin-change Lambda (updatePackage | submitNOSO | submitSplitSPA)
# by direct AWS Lambda invoke, parse the API-Gateway-shaped response, and report a
# clear PASS/FAIL plus machine-readable MARKER lines for callers to branch on.
#
# Profile resolution:
#   - If --profile is passed, it is used verbatim.
#   - Otherwise, if ONEMAC_ADMIN_PROFILE is set, non-empty, and that profile is
#     available, it is used.
#   - Otherwise the default profile is used (no --profile flag is sent to the AWS CLI).
#
# Production confirmation:
#   - Stage "production" requires confirmation before invoke.
#   - Pass --yes, or export CONFIRM=1, to skip the prompt.
#   - On a TTY, the operator must type yes. Otherwise the script exits 2.
#
# Exit codes:
#   0  Lambda returned statusCode 200
#   2  bad/missing arguments, or production confirmation missing/declined
#   3  not authenticated for the resolved profile
#   4  "aws lambda invoke" transport failure
#   5  the Lambda threw an unhandled error (FunctionError)
#   6  could not parse the Lambda response payload
#   10 the Lambda returned a non-200 statusCode (business error, e.g. validation)
#
# MARKER lines printed to stdout when applicable (at most one):
#   MARKER: ID_ALREADY_EXISTS   -> response contained "This ID already exists" (update-id collision)
#   MARKER: ALREADY_EXISTS      -> otherwise, the message contained "already exists" (e.g. NOSO collision)

set -euo pipefail

FUNCTION=""
PAYLOAD_FILE=""
STAGE="production"
REGION="us-east-1"
PROFILE=""
CONFIRM="${CONFIRM:-}"

usage() {
  cat >&2 <<'EOF'
Usage:
  invoke-admin-lambda.sh --function <updatePackage|submitNOSO|submitSplitSPA> \
                         --payload-file <path-to-json> \
                         [--stage <stage>]   (default: production)
                         [--region <region>] (default: us-east-1)
                         [--profile <name>]  (default: $ONEMAC_ADMIN_PROFILE if set, else the AWS default profile)
                         [--yes]             (skip the production confirmation prompt; CONFIRM=1 is equivalent)

The payload JSON must be the full direct-invoke event, e.g. {"body": { ... }}.
A production invoke stops unless --yes or CONFIRM=1 is set. On a TTY, type yes when prompted.
EOF
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --function)     FUNCTION="${2:-}"; shift 2 ;;
    --payload-file) PAYLOAD_FILE="${2:-}"; shift 2 ;;
    --stage)        STAGE="${2:-}"; shift 2 ;;
    --region)       REGION="${2:-}"; shift 2 ;;
    --profile)      PROFILE="${2:-}"; shift 2 ;;
    --yes)          CONFIRM=1; shift ;;
    -h|--help)      usage ;;
    *) echo "ERROR: unknown argument: $1" >&2; usage ;;
  esac
done

case "$FUNCTION" in
  updatePackage|submitNOSO|submitSplitSPA) ;;
  *) echo "ERROR: --function must be updatePackage, submitNOSO, or submitSplitSPA" >&2; usage ;;
esac

if [[ -z "$PAYLOAD_FILE" || ! -f "$PAYLOAD_FILE" ]]; then
  echo "ERROR: --payload-file must point to an existing JSON file" >&2
  usage
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: the AWS CLI ('aws') is not installed or not on PATH" >&2
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is required to parse the response" >&2
  exit 2
fi

# --- Resolve the AWS profile ---------------------------------------------------
profile_available() {
  local name="$1"
  if aws configure list-profiles >/dev/null 2>&1; then
    if aws configure list-profiles 2>/dev/null | grep -qx "$name"; then
      return 0
    fi
  fi
  if grep -qE "^\[(profile )?${name}\]" "${HOME}/.aws/config" 2>/dev/null; then
    return 0
  fi
  if grep -qE "^\[${name}\]" "${HOME}/.aws/credentials" 2>/dev/null; then
    return 0
  fi
  return 1
}

if [[ -z "$PROFILE" ]]; then
  if [[ -n "${ONEMAC_ADMIN_PROFILE:-}" ]] && profile_available "$ONEMAC_ADMIN_PROFILE"; then
    PROFILE="$ONEMAC_ADMIN_PROFILE"
  fi
fi

PROFILE_ARGS=()
if [[ -n "$PROFILE" ]]; then
  PROFILE_ARGS=(--profile "$PROFILE")
  RESOLVED_PROFILE="$PROFILE"
else
  RESOLVED_PROFILE="(default)"
fi

FUNCTION_NAME="mako-${STAGE}-api-${FUNCTION}"

echo "Function : ${FUNCTION_NAME}"
echo "Region   : ${REGION}"
echo "Profile  : ${RESOLVED_PROFILE}"
echo "Payload  : ${PAYLOAD_FILE}"

# --- Production confirmation ---------------------------------------------------
if [[ "$STAGE" == "production" && "$CONFIRM" != "1" ]]; then
  if [[ -t 0 ]]; then
    answer=""
    read -r -p "Type 'yes' to invoke ${FUNCTION_NAME} in ${STAGE}: " answer || true
    if [[ "$answer" != "yes" ]]; then
      echo "Aborted." >&2
      exit 2
    fi
  else
    echo "ERROR: refusing to invoke ${FUNCTION_NAME} in ${STAGE} without confirmation. Pass --yes to proceed." >&2
    exit 2
  fi
fi

# --- Auth pre-check ------------------------------------------------------------
if ! aws sts get-caller-identity "${PROFILE_ARGS[@]+"${PROFILE_ARGS[@]}"}" --region "$REGION" >/dev/null 2>&1; then
  echo "ERROR: not authenticated for profile ${RESOLVED_PROFILE}." >&2
  echo "       Try: aws sso login --profile ${PROFILE:-default}" >&2
  exit 3
fi

# --- Invoke --------------------------------------------------------------------
OUT_FILE="$(mktemp "${TMPDIR:-/tmp}/admin-lambda-out.XXXXXX")"
META_FILE="$(mktemp "${TMPDIR:-/tmp}/admin-lambda-meta.XXXXXX")"
ERR_FILE="$(mktemp "${TMPDIR:-/tmp}/admin-lambda-err.XXXXXX")"
cleanup() { rm -f "$OUT_FILE" "$META_FILE" "$ERR_FILE"; }
trap cleanup EXIT

set +e
aws lambda invoke \
  --function-name "$FUNCTION_NAME" \
  --cli-binary-format raw-in-base64-out \
  --payload "file://${PAYLOAD_FILE}" \
  "${PROFILE_ARGS[@]+"${PROFILE_ARGS[@]}"}" \
  --region "$REGION" \
  "$OUT_FILE" >"$META_FILE" 2>"$ERR_FILE"
INVOKE_RC=$?
set -e

if [[ $INVOKE_RC -ne 0 ]]; then
  echo "ERROR: 'aws lambda invoke' failed:" >&2
  cat "$ERR_FILE" >&2 || true
  exit 4
fi

if grep -q '"FunctionError"' "$META_FILE" 2>/dev/null; then
  echo "FUNCTION_ERROR: the Lambda threw an unhandled error. Raw payload:" >&2
  cat "$OUT_FILE" >&2
  exit 5
fi

# --- Parse the API-Gateway-shaped response ------------------------------------
set +e
node -e '
const fs = require("fs");
const raw = fs.readFileSync(process.argv[1], "utf8");
let data;
try {
  data = JSON.parse(raw);
} catch (exc) {
  const err = exc && exc.message ? exc.message : String(exc);
  console.error("PARSE_ERROR: could not parse the Lambda response. Raw payload:");
  console.error(raw);
  console.log("PARSE_ERROR: " + err);
  process.exit(6);
}

function isDict(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatPrinted(value) {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

const status = isDict(data) ? data.statusCode : undefined;
const body = isDict(data) ? data.body : data;

let message = body;
if (typeof body === "string") {
  try {
    const parsed = JSON.parse(body);
    if (isDict(parsed)) {
      message = Object.prototype.hasOwnProperty.call(parsed, "message") ? parsed.message : parsed;
    } else {
      message = parsed;
    }
  } catch (_exc) {
    message = body;
  }
} else if (isDict(body)) {
  message = Object.prototype.hasOwnProperty.call(body, "message") ? body.message : body;
}

const statusLabel = status === undefined || status === null ? "None" : String(status);
console.log("STATUS_CODE: " + statusLabel);
console.log("MESSAGE: " + formatPrinted(message));

const blob = JSON.stringify(data);
if (typeof blob === "string" && blob.includes("This ID already exists")) {
  console.log("MARKER: ID_ALREADY_EXISTS");
} else if (typeof message === "string" && message.includes("already exists")) {
  console.log("MARKER: ALREADY_EXISTS");
}

process.exit(status === 200 ? 0 : 10);
' "$OUT_FILE"
RC=$?
set -e

exit "$RC"
