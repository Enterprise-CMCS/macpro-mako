import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DescribeExecutionCommand, SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createError } from "@middy/util";
import { opensearch } from "shared-types";

import {
  buildAttachmentArchiveCurrent,
  buildPackageAttachmentArchiveManifest,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveCurrentKey,
  getArchiveDownloadFilename,
  getArchiveManifestKey,
  parseAttachmentArchiveCurrent,
} from "../attachment-archive/archive-manifest";
import { getAttachmentBucketMap } from "../attachment-archive/bucket-routing";
import {
  type AttachmentArchiveCurrentResolution,
  resolveAttachmentArchiveCurrentState,
} from "../attachment-archive/current-state";
import {
  buildAttachmentArchiveSections,
  getAttachmentArchiveSectionById,
} from "../attachment-archive/package-activity";
import {
  getJsonObject,
  getObjectText,
  objectExists,
  putJsonObject,
} from "../attachment-archive/storage";
import {
  AttachmentArchiveCurrent,
  AttachmentArchivePackageManifest,
  AttachmentArchiveScope,
  AttachmentArchiveSectionManifest,
  AttachmentArchiveStateMachineInput,
} from "../attachment-archive/types";

const DEFAULT_POLL_AFTER_SECONDS = 3;
const DEFAULT_REBUILD_START_DELAY_MS = 1000;
const awsRegion = process.env.region || process.env.AWS_REGION;

const archiveBucketClient = new S3Client({ region: awsRegion });
const stateMachineClient = new SFNClient({ region: awsRegion });

type ArchiveArtifactPlan = {
  scope: AttachmentArchiveScope;
  attachmentCount: number;
  artifactKey: string;
  currentKey: string;
  downloadFilename: string;
  hash: string;
  manifest: AttachmentArchivePackageManifest | AttachmentArchiveSectionManifest;
  manifestKey: string;
  sectionId?: string;
  sectionNumber?: number;
  sectionLabel?: string;
  sectionFolderName?: string;
};

type ArchiveArtifactResult = {
  artifact: ArchiveArtifactPlan;
  current?: AttachmentArchiveCurrent;
  started: boolean;
  status: "FAILED" | "PENDING" | "READY" | "RUNNING";
};

type PackageArchivePlan = {
  packageArtifact: ArchiveArtifactPlan;
  sectionArtifacts: ArchiveArtifactPlan[];
};

function getArchiveBucketName(): string {
  const bucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("ATTACHMENT_ARCHIVE_BUCKET_NAME must be defined");
  }

  return bucketName;
}

function getArchiveStateMachineArn(): string {
  const stateMachineArn = process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN;
  if (!stateMachineArn) {
    throw new Error("ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN must be defined");
  }

  return stateMachineArn;
}

function getArchiveRebuildStartDelayMs(): number {
  const rawValue = process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS;
  if (!rawValue) {
    return DEFAULT_REBUILD_START_DELAY_MS;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(
      JSON.stringify({
        event: "attachment_archive_rebuild_invalid_start_delay",
        value: rawValue,
        fallbackDelayMs: DEFAULT_REBUILD_START_DELAY_MS,
      }),
    );
    return DEFAULT_REBUILD_START_DELAY_MS;
  }

  return parsed;
}

async function sleep(ms: number) {
  if (ms <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildReadyResponse({
  archiveBucketName,
  artifactKey,
  fileName,
}: {
  archiveBucketName: string;
  artifactKey: string;
  fileName: string;
}) {
  const url = await getSignedUrl(
    archiveBucketClient,
    new GetObjectCommand({
      Bucket: archiveBucketName,
      Key: artifactKey,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    }),
    { expiresIn: 60 },
  );

  return {
    status: "READY" as const,
    filename: fileName,
    url,
  };
}

function createArchiveExecutionIdentity(hash: string) {
  const executionName = `attachment-archive-${hash.slice(0, 24)}-${Date.now()}-${Math.floor(
    Math.random() * 1_000_000,
  )}`;
  const stateMachineArn = getArchiveStateMachineArn();
  const [prefix, stateMachineName] = stateMachineArn.split(":stateMachine:");
  if (!prefix || !stateMachineName) {
    throw new Error(`Invalid attachment archive state machine ARN: ${stateMachineArn}`);
  }

  return {
    executionArn: `${prefix}:execution:${stateMachineName}:${executionName}`,
    executionName,
    stateMachineArn,
  };
}

async function startArchiveExecution({
  input,
  executionName,
  stateMachineArn,
}: {
  input: AttachmentArchiveStateMachineInput;
  executionName: string;
  stateMachineArn: string;
}) {
  await stateMachineClient.send(
    new StartExecutionCommand({
      stateMachineArn,
      input: JSON.stringify(input),
      name: executionName,
    }),
  );
}

function buildPackageArchivePlan({
  packageId,
  changelog,
}: {
  packageId: string;
  changelog: opensearch.changelog.ItemResult[];
}): PackageArchivePlan | undefined {
  const sectionDescriptors = buildAttachmentArchiveSections({ packageId, changelog });
  if (sectionDescriptors.length === 0) {
    return undefined;
  }

  const sectionArtifacts = sectionDescriptors.map<ArchiveArtifactPlan>((section) => {
    const manifest = buildSectionAttachmentArchiveManifest({
      packageId,
      scope: "section",
      sectionId: section.sectionId,
      sectionNumber: section.sectionNumber,
      sectionLabel: section.sectionLabel,
      sectionFolderName: section.sectionFolderName,
      rootFolderName: section.rootFolderName,
      attachments: section.attachments,
    });
    const currentKey = getArchiveCurrentKey({
      packageId,
      scope: "section",
      sectionId: section.sectionId,
    });
    const manifestKey = getArchiveManifestKey(
      {
        packageId,
        scope: "section",
        sectionId: section.sectionId,
      },
      manifest.hash,
    );
    const artifactKey = getArchiveArtifactKey(
      {
        packageId,
        scope: "section",
        sectionId: section.sectionId,
      },
      manifest.hash,
    );

    return {
      scope: "section",
      attachmentCount: manifest.attachments.length,
      artifactKey,
      currentKey,
      downloadFilename: getArchiveDownloadFilename({
        packageId,
        scope: "section",
        sectionNumber: section.sectionNumber,
        sectionLabel: section.sectionLabel,
      }),
      hash: manifest.hash,
      manifest,
      manifestKey,
      sectionId: section.sectionId,
      sectionNumber: section.sectionNumber,
      sectionLabel: section.sectionLabel,
      sectionFolderName: section.sectionFolderName,
    };
  });

  const packageManifest = buildPackageAttachmentArchiveManifest({
    packageId,
    sections: sectionArtifacts.map((artifact) => ({
      sectionId: artifact.sectionId as string,
      sectionNumber: artifact.sectionNumber as number,
      sectionLabel: artifact.sectionLabel as string,
      sectionFolderName: artifact.sectionFolderName as string,
      rootFolderName: artifact.manifest.rootFolderName,
      artifactKey: artifact.artifactKey,
      attachmentCount: artifact.attachmentCount,
      hash: artifact.hash,
      manifestKey: artifact.manifestKey,
    })),
  });

  const packageArtifact: ArchiveArtifactPlan = {
    scope: "all",
    attachmentCount: sectionArtifacts.reduce(
      (total, artifact) => total + artifact.attachmentCount,
      0,
    ),
    artifactKey: getArchiveArtifactKey({ packageId, scope: "all" }, packageManifest.hash),
    currentKey: getArchiveCurrentKey({ packageId, scope: "all" }),
    downloadFilename: getArchiveDownloadFilename({ packageId, scope: "all" }),
    hash: packageManifest.hash,
    manifest: packageManifest,
    manifestKey: getArchiveManifestKey({ packageId, scope: "all" }, packageManifest.hash),
  };

  return {
    packageArtifact,
    sectionArtifacts,
  };
}

function getRequestedArtifact({
  packageId,
  scope,
  sectionId,
  changelog,
}: {
  packageId: string;
  scope: AttachmentArchiveScope;
  sectionId?: string;
  changelog: opensearch.changelog.ItemResult[];
}): ArchiveArtifactPlan {
  const plan = buildPackageArchivePlan({ packageId, changelog });
  if (!plan) {
    throw createError(
      404,
      JSON.stringify({ message: "No attachments found for the requested archive" }),
    );
  }

  if (scope === "all") {
    return plan.packageArtifact;
  }

  if (!sectionId) {
    throw createError(
      400,
      JSON.stringify({ message: "sectionId is required for section archives" }),
    );
  }

  if (!getAttachmentArchiveSectionById({ packageId, changelog, sectionId })) {
    throw createError(
      404,
      JSON.stringify({ message: `No package activity found for section ${sectionId}` }),
    );
  }

  const sectionArtifact = plan.sectionArtifacts.find(
    (artifact) => artifact.sectionId === sectionId,
  );
  if (!sectionArtifact) {
    throw createError(
      404,
      JSON.stringify({ message: "No attachments found for the requested archive" }),
    );
  }

  return sectionArtifact;
}

async function getArchiveArtifactCurrent({
  archiveBucketName,
  artifact,
}: {
  archiveBucketName: string;
  artifact: ArchiveArtifactPlan;
}) {
  const rawCurrent = await getObjectText({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: artifact.currentKey,
  });

  return parseAttachmentArchiveCurrent(rawCurrent);
}

async function isArchiveExecutionRunning(executionArn: string): Promise<boolean> {
  try {
    const response = await stateMachineClient.send(
      new DescribeExecutionCommand({
        executionArn,
      }),
    );

    return response.status === "RUNNING";
  } catch (error) {
    const errorName = (error as { name?: string })?.name;
    if (errorName === "ExecutionDoesNotExist") {
      return false;
    }

    throw error;
  }
}

async function resolveArchiveArtifactState({
  archiveBucketName,
  artifact,
  current,
}: {
  archiveBucketName: string;
  artifact: ArchiveArtifactPlan;
  current?: AttachmentArchiveCurrent;
}): Promise<AttachmentArchiveCurrentResolution> {
  const artifactKey = current?.artifactKey || artifact.artifactKey;
  const artifactExists =
    current?.status === "READY"
      ? await objectExists({
          client: archiveBucketClient,
          bucket: archiveBucketName,
          key: artifactKey,
        })
      : false;
  const hasRunningExecution = current?.executionArn
    ? await isArchiveExecutionRunning(current.executionArn)
    : undefined;

  return resolveAttachmentArchiveCurrentState({
    expectedHash: artifact.hash,
    current,
    artifactExists,
    hasRunningExecution,
  });
}

async function ensureArchiveArtifact({
  archiveBucketName,
  artifact,
  beforeStart,
}: {
  archiveBucketName: string;
  artifact: ArchiveArtifactPlan;
  beforeStart?: () => Promise<void>;
}): Promise<ArchiveArtifactResult> {
  const current = await getArchiveArtifactCurrent({ archiveBucketName, artifact });
  const resolution = await resolveArchiveArtifactState({
    archiveBucketName,
    artifact,
    current,
  });

  if (resolution.action === "ready") {
    return { artifact, current, started: false, status: "READY" };
  }

  if (resolution.action === "in_progress") {
    return { artifact, current, started: false, status: resolution.status };
  }

  await putJsonObject({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: artifact.manifestKey,
    body: artifact.manifest,
  });

  await beforeStart?.();

  const { executionArn, executionName, stateMachineArn } = createArchiveExecutionIdentity(
    artifact.hash,
  );

  await putJsonObject({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: artifact.currentKey,
    body: buildAttachmentArchiveCurrent({
      scope: artifact.scope,
      hash: artifact.hash,
      status: "PENDING",
      artifactKey: artifact.artifactKey,
      manifestKey: artifact.manifestKey,
      attachmentCount: artifact.attachmentCount,
      executionArn,
      sectionId: artifact.sectionId,
      sectionNumber: artifact.sectionNumber,
      sectionLabel: artifact.sectionLabel,
      sectionFolderName: artifact.sectionFolderName,
    }),
  });

  try {
    await startArchiveExecution({
      input: {
        archiveBucketName,
        artifactKey: artifact.artifactKey,
        attachmentCount: artifact.attachmentCount,
        currentKey: artifact.currentKey,
        hash: artifact.hash,
        manifestKey: artifact.manifestKey,
      },
      executionName,
      stateMachineArn,
    });
  } catch (error) {
    await putJsonObject({
      client: archiveBucketClient,
      bucket: archiveBucketName,
      key: artifact.currentKey,
      body: buildAttachmentArchiveCurrent({
        scope: artifact.scope,
        hash: artifact.hash,
        status: "FAILED",
        artifactKey: artifact.artifactKey,
        manifestKey: artifact.manifestKey,
        attachmentCount: artifact.attachmentCount,
        executionArn,
        sectionId: artifact.sectionId,
        sectionNumber: artifact.sectionNumber,
        sectionLabel: artifact.sectionLabel,
        sectionFolderName: artifact.sectionFolderName,
        errorMessage:
          error instanceof Error ? error.message : "Attachment archive execution failed to start",
      }),
    });

    throw error;
  }

  return {
    artifact,
    current: buildAttachmentArchiveCurrent({
      scope: artifact.scope,
      hash: artifact.hash,
      status: "PENDING",
      artifactKey: artifact.artifactKey,
      manifestKey: artifact.manifestKey,
      attachmentCount: artifact.attachmentCount,
      executionArn,
      sectionId: artifact.sectionId,
      sectionNumber: artifact.sectionNumber,
      sectionLabel: artifact.sectionLabel,
      sectionFolderName: artifact.sectionFolderName,
    }),
    started: true,
    status: "PENDING",
  };
}

export async function getRequestedAttachmentArchiveStatus({
  packageId,
  scope,
  sectionId,
  changelog,
}: {
  packageId: string;
  scope: AttachmentArchiveScope;
  sectionId?: string;
  changelog: opensearch.changelog.ItemResult[];
}) {
  const archiveBucketName = getArchiveBucketName();
  const artifact = getRequestedArtifact({ packageId, scope, sectionId, changelog });
  const current = await getArchiveArtifactCurrent({ archiveBucketName, artifact });
  const resolution = await resolveArchiveArtifactState({
    archiveBucketName,
    artifact,
    current,
  });

  if (resolution.action === "ready") {
    return {
      response: await buildReadyResponse({
        archiveBucketName,
        artifactKey: current?.artifactKey || artifact.artifactKey,
        fileName: artifact.downloadFilename,
      }),
      needsRebuild: false,
    };
  }

  if (resolution.action === "in_progress") {
    return {
      response: {
        status: "PENDING" as const,
        pollAfterSeconds: DEFAULT_POLL_AFTER_SECONDS,
      },
      needsRebuild: false,
    };
  }

  return {
    response: {
      status: "PENDING" as const,
      pollAfterSeconds: DEFAULT_POLL_AFTER_SECONDS,
    },
    needsRebuild: true,
  };
}

export async function validateAttachmentArchiveCompletion({
  archiveBucketName,
  currentKey,
  hash,
  artifactKey,
}: {
  archiveBucketName: string;
  currentKey: string;
  hash: string;
  artifactKey: string;
}) {
  const current = await getJsonObject<AttachmentArchiveCurrent>({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: currentKey,
  });

  if (!current) {
    throw new Error(`Attachment archive current state was not found at ${currentKey}`);
  }

  if (current.hash !== hash) {
    throw new Error(`Attachment archive hash mismatch for ${currentKey}`);
  }

  if (current.status !== "READY") {
    throw new Error(
      `Attachment archive current state at ${currentKey} is ${current.status}, expected READY`,
    );
  }

  if (current.artifactKey !== artifactKey) {
    throw new Error(
      `Attachment archive artifact key mismatch for ${currentKey}: expected ${artifactKey}, got ${current.artifactKey}`,
    );
  }

  const exists = await objectExists({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: artifactKey,
  });

  if (!exists) {
    throw new Error(`Attachment archive artifact was not found at ${artifactKey}`);
  }

  return {
    ok: true as const,
  };
}

export async function rebuildPackageAttachmentArchives({
  packageId,
  changelog,
}: {
  packageId: string;
  changelog: opensearch.changelog.ItemResult[];
}) {
  const plan = buildPackageArchivePlan({ packageId, changelog });
  if (!plan) {
    return {
      packageId,
      packageStatus: "SKIPPED" as const,
      sectionResults: [],
    };
  }

  const archiveBucketName = getArchiveBucketName();
  const rebuildStartDelayMs = getArchiveRebuildStartDelayMs();
  let startedArtifactCount = 0;
  let delayedStartCount = 0;
  const waitForStartThrottle = async () => {
    if (startedArtifactCount === 0 || rebuildStartDelayMs <= 0) {
      return;
    }

    delayedStartCount += 1;
    console.info(
      JSON.stringify({
        event: "attachment_archive_rebuild_start_delay",
        packageId,
        delayMs: rebuildStartDelayMs,
        startedArtifactCount,
      }),
    );
    await sleep(rebuildStartDelayMs);
  };
  const ensureArchiveArtifactWithThrottle = async (artifact: ArchiveArtifactPlan) => {
    const result = await ensureArchiveArtifact({
      archiveBucketName,
      artifact,
      beforeStart: waitForStartThrottle,
    });
    if (result.started) {
      startedArtifactCount += 1;
    }
    return result;
  };
  const sectionResults: ArchiveArtifactResult[] = [];
  for (const sectionArtifact of plan.sectionArtifacts) {
    sectionResults.push(await ensureArchiveArtifactWithThrottle(sectionArtifact));
  }

  const packageResult = await ensureArchiveArtifactWithThrottle(plan.packageArtifact);

  return {
    packageId,
    packageStatus: packageResult.status,
    rebuildStartDelayMs,
    startedArtifactCount,
    delayedStartCount,
    sectionResults: sectionResults.map((result) => ({
      sectionId: result.artifact.sectionId,
      started: result.started,
      status: result.status,
    })),
  };
}

export async function markAttachmentArchiveFailed({
  archiveBucketName,
  currentKey,
  hash,
  artifactKey,
  manifestKey,
  attachmentCount,
  errorMessage,
}: {
  archiveBucketName: string;
  currentKey: string;
  hash: string;
  artifactKey: string;
  manifestKey: string;
  attachmentCount: number;
  errorMessage: string;
}) {
  const current = await getJsonObject<AttachmentArchiveCurrent>({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: currentKey,
  });

  if (current?.hash && current.hash !== hash) {
    return {
      skipped: true,
      reason: "hash_mismatch",
    };
  }

  const scope = current?.scope || (currentKey.includes("/all/") ? "all" : "section");

  await putJsonObject({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: currentKey,
    body: buildAttachmentArchiveCurrent({
      scope,
      hash,
      status: "FAILED",
      artifactKey,
      manifestKey,
      attachmentCount,
      executionArn: current?.executionArn,
      sectionId: current?.sectionId,
      sectionNumber: current?.sectionNumber,
      sectionLabel: current?.sectionLabel,
      sectionFolderName: current?.sectionFolderName,
      errorMessage,
    }),
  });

  return {
    skipped: false,
  };
}

export function getLegacyAttachmentBucketMap() {
  return getAttachmentBucketMap(process.env.LEGACY_ATTACHMENT_BUCKET_MAP, (message) => {
    console.warn(
      JSON.stringify({
        event: "legacy_attachment_bucket_map_invalid",
        message,
      }),
    );
  });
}
