#!/usr/bin/env bash
#
# invoke-admin-lambda.sh
# Invoke a OneMAC admin-change Lambda (updatePackage | submitNOSO | submitSplitSPA)
# by direct AWS Lambda invoke, parse the API-Gateway-shaped response, and report a
# clear PASS/FAIL plus machine-readable MARKER lines for callers to branch on.
#
# Profile resolution:
#   - If --profile is passed, it is used verbatim.
#   - Otherwise, if an "onemac-prod" profile exists in the user's AWS config/credentials,
#     it is used automatically (these are production changes).
#   - Otherwise the default profile is used (no --profile flag is sent to the AWS CLI).
#
# Exit codes:
#   0  Lambda returned statusCode 200
#   2  bad/missing arguments
#   3  not authenticated for the resolved profile
#   4  "aws lambda invoke" transport failure
#   5  the Lambda threw an unhandled error (FunctionError)
#   6  could not parse the Lambda response payload
#   10 the Lambda returned a non-200 statusCode (business error, e.g. validation)
#
# MARKER lines printed to stdout when applicable:
#   MARKER: ID_ALREADY_EXISTS   -> response contained "This ID already exists" (update-id collision)
#   MARKER: ALREADY_EXISTS      -> response message contained "already exists" (e.g. NOSO collision)

set -euo pipefail

FUNCTION=""
PAYLOAD_FILE=""
STAGE="production"
REGION="us-east-1"
PROFILE=""

usage() {
  cat >&2 <<'EOF'
Usage:
  invoke-admin-lambda.sh --function <updatePackage|submitNOSO|submitSplitSPA> \
                         --payload-file <path-to-json> \
                         [--stage <stage>]   (default: production)
                         [--region <region>] (default: us-east-1)
                         [--profile <name>]  (default: auto -> onemac-prod if present, else default)

The payload JSON must be the full direct-invoke event, e.g. {"body": { ... }}.
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
  if profile_available "onemac-prod"; then
    PROFILE="onemac-prod"
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

# --- Auth pre-check ------------------------------------------------------------
if ! aws sts get-caller-identity "${PROFILE_ARGS[@]}" --region "$REGION" >/dev/null 2>&1; then
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
  "${PROFILE_ARGS[@]}" \
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

echo "----- Lambda response -----"
cat "$OUT_FILE"
echo
echo "---------------------------"

# --- Parse the API-Gateway-shaped response ------------------------------------
set +e
python3 - "$OUT_FILE" <<'PY'
import json, sys

with open(sys.argv[1]) as fh:
    raw = fh.read()

try:
    data = json.loads(raw)
except Exception as exc:  # noqa: BLE001
    print(f"PARSE_ERROR: {exc}")
    sys.exit(6)

status = data.get("statusCode") if isinstance(data, dict) else None
body = data.get("body") if isinstance(data, dict) else data

message = body
if isinstance(body, str):
    try:
        parsed = json.loads(body)
        message = parsed.get("message", parsed) if isinstance(parsed, dict) else parsed
    except Exception:  # noqa: BLE001
        message = body
elif isinstance(body, dict):
    message = body.get("message", body)

print(f"STATUS_CODE: {status}")
print(f"MESSAGE: {message}")

blob = json.dumps(data)
if "This ID already exists" in blob:
    print("MARKER: ID_ALREADY_EXISTS")
if isinstance(message, str) and "already exists" in message:
    print("MARKER: ALREADY_EXISTS")

sys.exit(0 if status == 200 else 10)
PY
RC=$?
set -e

exit $RC
