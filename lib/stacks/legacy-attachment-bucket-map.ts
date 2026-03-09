export function resolveLegacyAttachmentBucketMapStage(stage: string): string {
  return ["main", "val", "production"].includes(stage) ? stage : "main";
}

export function getLegacyAttachmentBucketMapParameterName(project: string, stage: string): string {
  const parameterStage = resolveLegacyAttachmentBucketMapStage(stage);
  return `/${project}/${parameterStage}/legacy-attachment-bucket-map`;
}
