const SHARED_ARCHIVE_STAGES = ["main", "val", "production"] as const;

export function isSharedArchiveStage(stage: string): boolean {
  return SHARED_ARCHIVE_STAGES.includes(stage as (typeof SHARED_ARCHIVE_STAGES)[number]);
}

export function resolveArchiveBaseReadStage(stage: string): string {
  return isSharedArchiveStage(stage) ? stage : "main";
}

export function getArchiveBaseReadBucket(
  project: string,
  stage: string,
  account: string,
): {
  stage: string;
  name: string;
  arn: string;
} {
  const readStage = resolveArchiveBaseReadStage(stage);
  const name = `${project}-${readStage}-attachment-archives-${account}`;

  return {
    stage: readStage,
    name,
    arn: `arn:aws:s3:::${name}`,
  };
}

export function getEphemeralArchiveOverlayBucket(
  project: string,
  account: string,
): {
  name: string;
  arn: string;
} {
  const name = `${project}-ephemeral-attachment-archives-${account}`;

  return {
    name,
    arn: `arn:aws:s3:::${name}`,
  };
}

export function getArchiveOverlayPrefix(stage: string): string {
  return isSharedArchiveStage(stage) ? "" : `stage/${stage}`;
}
