#!/usr/bin/env bash

set -euo pipefail

AWS_REGION=${AWS_REGION:-us-east-1}
DELETE_IMAGES=${DELETE_IMAGES:-false}
CRITICAL_ONLY=${CRITICAL_ONLY:-true}
MIN_IMAGE_AGE_DAYS=${MIN_IMAGE_AGE_DAYS:-3}
REPOSITORY_NAME=${REPOSITORY_NAME:-}
ALLOW_NON_CDK_ASSET_REPOSITORY=${ALLOW_NON_CDK_ASSET_REPOSITORY:-false}

if ! command -v aws >/dev/null 2>&1; then
  echo "aws is required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required." >&2
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
EXPECTED_REPOSITORY_NAME="cdk-hnb659fds-container-assets-${ACCOUNT_ID}-${AWS_REGION}"

if [[ -z "$REPOSITORY_NAME" ]]; then
  REPOSITORY_NAME="${EXPECTED_REPOSITORY_NAME}"
fi

if [[ "$REPOSITORY_NAME" != "$EXPECTED_REPOSITORY_NAME" && "$ALLOW_NON_CDK_ASSET_REPOSITORY" != "true" ]]; then
  cat >&2 <<EOF
Refusing to operate on repository '${REPOSITORY_NAME}'.
This script only deletes ECR image digests from the shared CDK bootstrap asset repository by default:
  ${EXPECTED_REPOSITORY_NAME}

If you intentionally want to target a different ECR repository, re-run with:
  ALLOW_NON_CDK_ASSET_REPOSITORY=true
EOF
  exit 1
fi

REPOSITORY_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPOSITORY_NAME}"
NOW_EPOCH=$(date +%s)

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

REFERENCED_DIGESTS_FILE="${TEMP_DIR}/referenced-digests.txt"
REFERENCED_TAGS_FILE="${TEMP_DIR}/referenced-tags.txt"
IMAGE_ROWS_FILE="${TEMP_DIR}/image-rows.jsonl"

add_referenced_digest() {
  local digest=$1
  if [[ "$digest" == sha256:* ]]; then
    echo "$digest" >> "$REFERENCED_DIGESTS_FILE"
  fi
}

while IFS= read -r function_name; do
  resolved_uri=$(
    aws lambda get-function \
      --region "$AWS_REGION" \
      --function-name "$function_name" \
      --query 'Code.ResolvedImageUri' \
      --output text 2>/dev/null || true
  )

  if [[ "$resolved_uri" == "${REPOSITORY_URI}"@sha256:* ]]; then
    add_referenced_digest "sha256:${resolved_uri##*@sha256:}"
  fi
done < <(
  aws lambda list-functions \
    --region "$AWS_REGION" \
    --query 'Functions[?PackageType==`Image`].FunctionName' \
    --output text |
    tr '\t' '\n' |
    sed '/^$/d'
)

while IFS= read -r task_definition; do
  if [[ -z "$task_definition" ]]; then
    continue
  fi

  while IFS= read -r image; do
    if [[ "$image" == "${REPOSITORY_URI}:"* ]]; then
      echo "${image#${REPOSITORY_URI}:}" >> "$REFERENCED_TAGS_FILE"
    elif [[ "$image" == "${REPOSITORY_URI}"@sha256:* ]]; then
      add_referenced_digest "sha256:${image##*@sha256:}"
    fi
  done < <(
    aws ecs describe-task-definition \
      --region "$AWS_REGION" \
      --task-definition "$task_definition" \
      --query 'taskDefinition.containerDefinitions[].image' \
      --output text |
      tr '\t' '\n' |
      sed '/^$/d'
  )
done < <(
  aws ecs list-task-definitions \
    --region "$AWS_REGION" \
    --status ACTIVE \
    --query 'taskDefinitionArns[]' \
    --output text |
    tr '\t' '\n' |
    sed '/^$/d'
)

if [[ -s "$REFERENCED_TAGS_FILE" ]]; then
  sort -u "$REFERENCED_TAGS_FILE" | while IFS= read -r image_tag; do
    digest=$(
      aws ecr batch-get-image \
        --region "$AWS_REGION" \
        --repository-name "$REPOSITORY_NAME" \
        --image-ids "imageTag=${image_tag}" \
        --query 'images[0].imageId.imageDigest' \
        --output text 2>/dev/null || true
    )
    add_referenced_digest "$digest"
  done
fi

if [[ -s "$REFERENCED_DIGESTS_FILE" ]]; then
  sort -u -o "$REFERENCED_DIGESTS_FILE" "$REFERENCED_DIGESTS_FILE"
fi

aws ecr describe-images \
  --region "$AWS_REGION" \
  --repository-name "$REPOSITORY_NAME" \
  --output json |
  jq -c '.imageDetails[] | {digest: .imageDigest, pushedAt: .imagePushedAt, tags: (.imageTags // [])}' > "$IMAGE_ROWS_FILE"

if [[ ! -s "$IMAGE_ROWS_FILE" ]]; then
  echo "No images found in ${REPOSITORY_NAME}."
  exit 0
fi

echo "Scope: ECR image digests only. This script does not delete IAM roles, S3 buckets, stacks, or other AWS resources."
echo "Repository: ${REPOSITORY_NAME}"
echo "Mode: $([[ "$DELETE_IMAGES" == "true" ]] && echo "delete" || echo "report-only")"
echo "Criteria: unreferenced by active Lambda image functions and active ECS task definitions, age >= ${MIN_IMAGE_AGE_DAYS} day(s)"
if [[ -s "$REFERENCED_DIGESTS_FILE" ]]; then
  echo "Referenced digests found: $(wc -l < "$REFERENCED_DIGESTS_FILE" | tr -d ' ')"
else
  echo "Referenced digests found: 0"
fi

CANDIDATE_COUNT=0
DELETED_COUNT=0

while IFS= read -r image_row; do
  digest=$(jq -r '.digest' <<<"$image_row")

  if [[ -s "$REFERENCED_DIGESTS_FILE" ]] && grep -Fxq "$digest" "$REFERENCED_DIGESTS_FILE"; then
    continue
  fi

  pushed_at=$(jq -r '.pushedAt' <<<"$image_row")
  pushed_epoch=$(
    python3 -c 'from datetime import datetime; import sys; print(int(datetime.fromisoformat(sys.argv[1]).timestamp()))' \
      "$pushed_at"
  )
  age_days=$(((NOW_EPOCH - pushed_epoch) / 86400))

  if (( age_days < MIN_IMAGE_AGE_DAYS )); then
    continue
  fi

  critical_count=0
  if [[ "$CRITICAL_ONLY" == "true" ]]; then
    critical_count=$(
      aws ecr describe-image-scan-findings \
        --no-paginate \
        --region "$AWS_REGION" \
        --repository-name "$REPOSITORY_NAME" \
        --image-id "imageDigest=${digest}" \
        --query 'imageScanFindings.findingSeverityCounts.CRITICAL' \
        --output text 2>/dev/null || true
    )

    critical_count=$(printf '%s' "$critical_count" | tr -d '[:space:]')

    if ! [[ "$critical_count" =~ ^[0-9]+$ ]]; then
      critical_count=0
    fi

    if (( critical_count == 0 )); then
      continue
    fi
  fi

  tags=$(jq -r '.tags | join(",")' <<<"$image_row")
  if [[ -z "$tags" ]]; then
    tags="<none>"
  fi

  echo "Candidate image: digest=${digest} tags=${tags} age_days=${age_days} critical=${critical_count}"
  CANDIDATE_COUNT=$((CANDIDATE_COUNT + 1))

  if [[ "$DELETE_IMAGES" != "true" ]]; then
    continue
  fi

  aws ecr batch-delete-image \
    --region "$AWS_REGION" \
    --repository-name "$REPOSITORY_NAME" \
    --image-ids "imageDigest=${digest}" >/dev/null

  echo "Deleted ${digest}"
  DELETED_COUNT=$((DELETED_COUNT + 1))
done < "$IMAGE_ROWS_FILE"

if [[ "$DELETE_IMAGES" == "true" ]]; then
  echo "Deleted ${DELETED_COUNT} image(s)."
else
  echo "Found ${CANDIDATE_COUNT} candidate image(s)."
fi
