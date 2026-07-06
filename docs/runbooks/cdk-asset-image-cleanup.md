# CDK Asset Image Cleanup Runbook

## Purpose

This runbook covers stale security findings on images retained in the shared CDK bootstrap ECR asset repository. These findings can remain active after a deployment has already moved runtime workloads to a newer image, because Inspector continues scanning retained image digests.

Use this process only for image digests that are no longer referenced by active Lambda image functions or active ECS task definitions. Do not use it to remediate an image that is still deployed.

## Current OpenSSL Finding

Inspector reported `CVE-2026-34182` on an inactive attachment archive worker image:

- Vulnerable digest: `sha256:5838d121a5b2d9bb4e1dc697cf6bbc85cdcad2df4352e58e6e5e8873dec99d11`
- Vulnerable tag: `9138e21ad9c95459ca063fdd5276fd1a3d34a2eeb77c4857b1f9299b01451ada`
- Runtime replacement: the active attachment archive ECS task definition uses a newer CDK asset image and did not have Inspector findings for this OpenSSL issue at review time.

## Report-Only Verification

Run the cleanup script in report-only mode first. The script is report-only by default and checks active Lambda image functions and active ECS task definitions before listing candidates.

```bash
AWS_REGION=us-east-1 \
MIN_IMAGE_AGE_DAYS=0 \
CRITICAL_ONLY=true \
TARGET_IMAGE_DIGEST=sha256:5838d121a5b2d9bb4e1dc697cf6bbc85cdcad2df4352e58e6e5e8873dec99d11 \
DELETE_IMAGES=false \
./scripts/cleanup-cdk-asset-images.sh
```

Expected result for this finding:

- The repository is the shared CDK bootstrap container asset repository.
- The script runs in `report-only` mode.
- The target digest is listed as a candidate.
- No active Lambda image function or active ECS task definition references the digest.

## Approval Gate

Production image deletion requires explicit approval in the active change thread before running delete mode.

Before approval, retain:

- Inspector finding ID and vulnerable digest.
- Report-only script output.
- Active ECS task definition image tag and digest.
- Inspector result for the active replacement image.

## Delete Procedure

After approval, run the same targeted command with delete mode enabled:

```bash
AWS_REGION=us-east-1 \
MIN_IMAGE_AGE_DAYS=0 \
CRITICAL_ONLY=true \
TARGET_IMAGE_DIGEST=sha256:5838d121a5b2d9bb4e1dc697cf6bbc85cdcad2df4352e58e6e5e8873dec99d11 \
DELETE_IMAGES=true \
./scripts/cleanup-cdk-asset-images.sh
```

## Post-Delete Verification

After deletion:

1. Confirm ECR no longer returns the deleted digest.
2. Confirm the active ECS task definition still references the newer image.
3. Confirm Inspector no longer reports the original finding as active after the next scan refresh.
4. Save the command output and Inspector status with the change record.
