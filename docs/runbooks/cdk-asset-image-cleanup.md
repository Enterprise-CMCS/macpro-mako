# CDK Asset Image Cleanup Runbook

## Purpose

This runbook covers stale security findings on images retained in the shared CDK bootstrap ECR asset repository. These findings can remain active after a deployment has already moved runtime workloads to a newer image, because Inspector continues scanning retained image digests.

Use this process only for image digests that are no longer referenced by active Lambda image functions or active ECS task definitions. Do not use it to remediate an image that is still deployed.

## Remediating Deployed Images

The ClamAV scanner and definition updater share one Lambda image. Attachment archive workers use a separate ECS image. Multiple CloudFormation environments can reference the same image digest, so merging a fix into one environment does not update the others.

To remediate deployed images:

1. Refresh the pinned Node 24 base image in `lib/local-constructs/clamav-scanning/Dockerfile` and the Bun Alpine image in `lib/attachment-archive/Dockerfile`. Keep the OS package upgrade steps so builds receive the patched Amazon Linux and Alpine packages.
2. Update vulnerable archive dependencies and regenerate `lib/attachment-archive/bun.lockb`. This worker is excluded from the root workspace; updating only the root lockfile does not change its production dependencies. Validate the archive schemas and ZIP generation when upgrading Zod or archive dependencies.
3. Increment `CACHE_BUST` in both Dockerfiles and the matching build arguments in `lib/local-constructs/clamav-scanning/index.ts` and `lib/stacks/api.ts`. Build and test both Linux AMD64 images before deployment.
4. Inventory the Lambda resolved image digests and active ECS task definitions in each affected account and region. Use their CloudFormation ownership and `STAGE` tags to identify every environment that still references an affected digest.
5. Deploy the patched revision to each environment that must remain active. Existing feature environments require their own deployment or an explicitly approved retirement. Follow normal promotion and approval requirements for `main`, `val`, and `production`.
6. After Inspector refreshes, verify the replacement digests resolve the original findings. A successful build or merged PR alone does not establish that the deployed findings are resolved.

Only after rollout should the old digests be considered for deletion. Also check published Lambda versions/aliases and running ECS tasks before deleting: the cleanup script checks current Lambda functions and active ECS task definitions, not those additional references.

For a targeted old digest with HIGH, MEDIUM, or LOW findings, use `CRITICAL_ONLY=false` in both the report and approved delete commands below. The default critical-only filter will skip those images.

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
