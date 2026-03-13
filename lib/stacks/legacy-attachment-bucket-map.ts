export function resolveLegacyAttachmentBucketMapStage(stage: string): string {
  return ["main", "val", "production"].includes(stage) ? stage : "main";
}

export function getLegacyAttachmentBucketMapParameterName(project: string, stage: string): string {
  const parameterStage = resolveLegacyAttachmentBucketMapStage(stage);
  return `/${project}/${parameterStage}/legacy-attachment-bucket-map`;
}

export function getLegacyAttachmentMirrorBuckets(
  project: string,
  stage: string,
  account: string,
): {
  stage: string;
  names: string[];
  arns: string[];
} {
  const mirrorStage = resolveLegacyAttachmentBucketMapStage(stage);
  const names = [
    `${project}-${mirrorStage}-legacy-attachments-${account}`,
    `${project}-${mirrorStage}-legacy-attachmentsbucket-${account}`,
  ];

  return {
    stage: mirrorStage,
    names,
    arns: names.map((name) => `arn:aws:s3:::${name}`),
  };
}
