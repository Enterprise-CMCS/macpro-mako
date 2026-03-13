import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
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

async function startArchiveExecution(input: AttachmentArchiveStateMachineInput) {
  await stateMachineClient.send(
    new StartExecutionCommand({
      stateMachineArn: getArchiveStateMachineArn(),
      input: JSON.stringify(input),
      name: `attachment-archive-${input.hash.slice(0, 24)}-${Date.now()}`,
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

async function ensureArchiveArtifact({
  archiveBucketName,
  artifact,
}: {
  archiveBucketName: string;
  artifact: ArchiveArtifactPlan;
}): Promise<ArchiveArtifactResult> {
  const current = await getArchiveArtifactCurrent({ archiveBucketName, artifact });

  if (current?.hash === artifact.hash) {
    if (current.status === "READY") {
      const exists = await objectExists({
        client: archiveBucketClient,
        bucket: archiveBucketName,
        key: current.artifactKey,
      });

      if (exists) {
        return { artifact, current, started: false, status: "READY" };
      }
    }

    if (current.status === "PENDING" || current.status === "RUNNING") {
      return { artifact, current, started: false, status: current.status };
    }
  }

  await putJsonObject({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: artifact.manifestKey,
    body: artifact.manifest,
  });

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
      sectionId: artifact.sectionId,
      sectionNumber: artifact.sectionNumber,
      sectionLabel: artifact.sectionLabel,
      sectionFolderName: artifact.sectionFolderName,
    }),
  });

  await startArchiveExecution({
    archiveBucketName,
    artifactKey: artifact.artifactKey,
    attachmentCount: artifact.attachmentCount,
    currentKey: artifact.currentKey,
    hash: artifact.hash,
    manifestKey: artifact.manifestKey,
  });

  return {
    artifact,
    current: buildAttachmentArchiveCurrent({
      scope: artifact.scope,
      hash: artifact.hash,
      status: "PENDING",
      artifactKey: artifact.artifactKey,
      manifestKey: artifact.manifestKey,
      attachmentCount: artifact.attachmentCount,
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

  if (current?.hash === artifact.hash) {
    if (current.status === "READY") {
      const exists = await objectExists({
        client: archiveBucketClient,
        bucket: archiveBucketName,
        key: current.artifactKey,
      });

      if (exists) {
        return {
          response: await buildReadyResponse({
            archiveBucketName,
            artifactKey: current.artifactKey,
            fileName: artifact.downloadFilename,
          }),
          needsRebuild: false,
        };
      }
    }

    if (current.status === "PENDING" || current.status === "RUNNING") {
      return {
        response: {
          status: "PENDING" as const,
          pollAfterSeconds: DEFAULT_POLL_AFTER_SECONDS,
        },
        needsRebuild: false,
      };
    }
  }

  return {
    response: {
      status: "PENDING" as const,
      pollAfterSeconds: DEFAULT_POLL_AFTER_SECONDS,
    },
    needsRebuild: true,
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
  const sectionResults: ArchiveArtifactResult[] = [];
  for (const sectionArtifact of plan.sectionArtifacts) {
    sectionResults.push(
      await ensureArchiveArtifact({
        archiveBucketName,
        artifact: sectionArtifact,
      }),
    );
  }

  const packageResult = await ensureArchiveArtifact({
    archiveBucketName,
    artifact: plan.packageArtifact,
  });

  return {
    packageId,
    packageStatus: packageResult.status,
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
