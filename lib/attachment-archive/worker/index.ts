import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import archiver, { Archiver } from "archiver";
import { PassThrough } from "stream";

import { buildAttachmentArchiveCurrent } from "../archive-manifest";
import { createAttachmentBucketClientFactory, getAttachmentBucketMap } from "../bucket-routing";
import { getJsonObject, putJsonObject } from "../storage";
import {
  AttachmentArchiveCurrent,
  AttachmentArchiveManifest,
  AttachmentArchiveManifestAttachment,
  AttachmentArchivePackageManifest,
  AttachmentArchiveSectionManifest,
} from "../types";
import { loadArchiveAttachment } from "./attachment-source";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be defined`);
  }

  return value;
}

const archiveBucketName = requireEnv("ARCHIVE_BUCKET_NAME");
const currentKey = requireEnv("ARCHIVE_CURRENT_KEY");
const manifestKey = requireEnv("ARCHIVE_MANIFEST_KEY");
const artifactKey = requireEnv("ARCHIVE_ARTIFACT_KEY");
const hash = requireEnv("ATTACHMENT_ARCHIVE_HASH");
const region = process.env.AWS_REGION || process.env.region;
const legacyS3AccessRoleArn =
  process.env.LEGACY_S3_ACCESS_ROLE_ARN || process.env.legacyS3AccessRoleArn;
const attachmentBucketMap = getAttachmentBucketMap(
  process.env.LEGACY_ATTACHMENT_BUCKET_MAP,
  (message) =>
    console.warn(
      JSON.stringify({
        event: "legacy_attachment_bucket_map_invalid",
        message,
      }),
    ),
);

const archiveBucketClient = new S3Client({ region });
const getAttachmentBucketClient = createAttachmentBucketClientFactory({
  region,
  legacyS3AccessRoleArn,
});

type AttachmentBody = NonNullable<GetObjectCommandOutput["Body"]>;

function isSectionManifest(
  manifest: AttachmentArchiveManifest,
): manifest is AttachmentArchiveSectionManifest {
  return manifest.version === 2 && manifest.type === "section" && manifest.scope === "section";
}

function isPackageManifest(
  manifest: AttachmentArchiveManifest,
): manifest is AttachmentArchivePackageManifest {
  return manifest.version === 2 && manifest.type === "package" && manifest.scope === "all";
}

async function getCurrentArchiveStatus(): Promise<AttachmentArchiveCurrent | undefined> {
  return await getJsonObject<AttachmentArchiveCurrent>({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: currentKey,
  });
}

async function putCurrentArchiveStatus(status: AttachmentArchiveCurrent): Promise<void> {
  await putJsonObject({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key: currentKey,
    body: status,
  });
}

async function markFailed(errorMessage: string): Promise<void> {
  const current = await getCurrentArchiveStatus();

  if (current?.hash && current.hash !== hash) {
    console.info(
      JSON.stringify({
        event: "attachment_archive_failure_ignored_stale_hash",
        currentHash: current.hash,
        workerHash: hash,
      }),
    );
    return;
  }

  await putCurrentArchiveStatus(
    buildAttachmentArchiveCurrent({
      scope: current?.scope || (currentKey.includes("/all/") ? "all" : "section"),
      hash,
      status: "FAILED",
      artifactKey,
      manifestKey,
      attachmentCount: current?.attachmentCount || 0,
      sectionId: current?.sectionId,
      sectionNumber: current?.sectionNumber,
      sectionLabel: current?.sectionLabel,
      sectionFolderName: current?.sectionFolderName,
      errorMessage,
    }),
  );
}

async function getAttachmentBody(bucket: string, key: string): Promise<AttachmentBody> {
  const client = await getAttachmentBucketClient(bucket);
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`Attachment ${bucket}/${key} returned an empty body`);
  }

  return response.Body;
}

async function loadManifest(key = manifestKey): Promise<AttachmentArchiveManifest> {
  const manifest = await getJsonObject<AttachmentArchiveManifest>({
    client: archiveBucketClient,
    bucket: archiveBucketName,
    key,
  });

  if (!manifest) {
    throw new Error(`Attachment archive manifest ${key} was not found`);
  }

  return manifest;
}

async function appendSectionManifest(
  archive: Archiver,
  manifest: AttachmentArchiveSectionManifest,
  pathResolver: (attachment: AttachmentArchiveManifestAttachment) => string,
): Promise<{
  appendedAttachmentCount: number;
  skippedAttachmentCount: number;
}> {
  let appendedAttachmentCount = 0;
  let skippedAttachmentCount = 0;

  for (const attachment of manifest.attachments) {
    const result = await loadArchiveAttachment({
      attachment,
      attachmentBucketMap,
      consumer: "attachment_archive_worker",
      getAttachmentBody,
    });

    if (result.skipped) {
      skippedAttachmentCount += 1;
      continue;
    }

    archive.append(Buffer.from(await result.body.transformToByteArray()), {
      name: pathResolver(attachment),
    });
    appendedAttachmentCount += 1;
  }

  return {
    appendedAttachmentCount,
    skippedAttachmentCount,
  };
}

async function buildArchiveFromManifest(
  archive: Archiver,
  manifest: AttachmentArchiveManifest,
): Promise<{
  manifest: AttachmentArchiveManifest;
  appendedAttachmentCount: number;
  skippedAttachmentCount: number;
}> {
  if (isSectionManifest(manifest)) {
    if (manifest.hash !== hash) {
      throw new Error(
        `Attachment archive manifest hash mismatch: expected ${hash}, got ${manifest.hash}`,
      );
    }

    const result = await appendSectionManifest(
      archive,
      manifest,
      (attachment) => attachment.archivePath,
    );
    return {
      manifest,
      ...result,
    };
  }

  if (!isPackageManifest(manifest)) {
    throw new Error(`Unsupported attachment archive manifest at ${manifestKey}`);
  }

  if (manifest.hash !== hash) {
    throw new Error(
      `Attachment archive manifest hash mismatch: expected ${hash}, got ${manifest.hash}`,
    );
  }

  let appendedAttachmentCount = 0;
  let skippedAttachmentCount = 0;

  for (const section of manifest.sections) {
    const sectionManifest = await loadManifest(section.manifestKey);
    if (!isSectionManifest(sectionManifest)) {
      throw new Error(`Section manifest ${section.manifestKey} is invalid`);
    }

    if (sectionManifest.hash !== section.hash) {
      throw new Error(
        `Section manifest hash mismatch for ${section.sectionId}: expected ${section.hash}, got ${sectionManifest.hash}`,
      );
    }

    const result = await appendSectionManifest(
      archive,
      sectionManifest,
      (attachment) =>
        `${manifest.rootFolderName}/${section.sectionFolderName}/${attachment.archiveFilename}`,
    );
    appendedAttachmentCount += result.appendedAttachmentCount;
    skippedAttachmentCount += result.skippedAttachmentCount;
  }

  return {
    manifest,
    appendedAttachmentCount,
    skippedAttachmentCount,
  };
}

function buildCurrentFromManifest(
  manifest: AttachmentArchiveManifest,
  status: AttachmentArchiveCurrent["status"],
  errorMessage?: string,
): AttachmentArchiveCurrent {
  return buildAttachmentArchiveCurrent({
    scope: manifest.scope,
    hash,
    status,
    artifactKey,
    manifestKey,
    attachmentCount:
      manifest.scope === "section"
        ? manifest.attachments.length
        : manifest.sections.reduce((total, section) => total + section.attachmentCount, 0),
    sectionId: manifest.scope === "section" ? manifest.sectionId : undefined,
    sectionNumber: manifest.scope === "section" ? manifest.sectionNumber : undefined,
    sectionLabel: manifest.scope === "section" ? manifest.sectionLabel : undefined,
    sectionFolderName: manifest.scope === "section" ? manifest.sectionFolderName : undefined,
    errorMessage,
  });
}

async function run(): Promise<void> {
  const current = await getCurrentArchiveStatus();

  if (!current) {
    console.info(
      JSON.stringify({
        event: "attachment_archive_skipped_missing_current_status",
        currentKey,
        hash,
      }),
    );
    return;
  }

  if (current.hash !== hash) {
    console.info(
      JSON.stringify({
        event: "attachment_archive_skipped_stale_hash",
        currentHash: current.hash,
        workerHash: hash,
      }),
    );
    return;
  }

  const manifest = await loadManifest();

  await putCurrentArchiveStatus(buildCurrentFromManifest(manifest, "RUNNING"));

  const zipOutputStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  const upload = new Upload({
    client: archiveBucketClient,
    params: {
      Bucket: archiveBucketName,
      Key: artifactKey,
      Body: zipOutputStream,
      ContentType: "application/zip",
    },
  });

  const archiveCompleted = new Promise<void>((resolve, reject) => {
    archive.on("warning", (error: Error) => {
      reject(error);
    });
    archive.on("error", (error: Error) => {
      reject(error);
    });
    archive.on("end", () => {
      resolve();
    });
  });

  archive.pipe(zipOutputStream);
  const builtArchive = await buildArchiveFromManifest(archive, manifest);
  await archive.finalize();
  await Promise.all([upload.done(), archiveCompleted]);

  const latestCurrent = await getCurrentArchiveStatus();
  if (!latestCurrent || latestCurrent.hash !== hash) {
    console.info(
      JSON.stringify({
        event: "attachment_archive_ready_ignored_stale_hash",
        currentHash: latestCurrent?.hash,
        workerHash: hash,
      }),
    );
    return;
  }

  await putCurrentArchiveStatus(buildCurrentFromManifest(builtArchive.manifest, "READY"));

  console.info(
    JSON.stringify({
      event: "attachment_archive_ready",
      artifactKey,
      hash,
      manifestType: builtArchive.manifest.type,
      attachmentCount: builtArchive.appendedAttachmentCount,
      skippedAttachmentCount: builtArchive.skippedAttachmentCount,
    }),
  );
}

run().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      event: "attachment_archive_failed",
      artifactKey,
      currentKey,
      hash,
      message,
    }),
  );

  try {
    await markFailed(message);
  } catch (statusError) {
    console.error(
      JSON.stringify({
        event: "attachment_archive_failed_status_update_error",
        message: statusError instanceof Error ? statusError.message : String(statusError),
      }),
    );
  }

  process.exitCode = 1;
});
