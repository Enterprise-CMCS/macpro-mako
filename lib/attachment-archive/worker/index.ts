import {
  GetObjectCommand,
  GetObjectCommandOutput,
  GetObjectTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import archiver, { Archiver } from "archiver";
import { randomUUID } from "crypto";
import { createReadStream, createWriteStream, promises as fs } from "fs";
import { join } from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

import { buildAttachmentArchiveCurrent } from "../archive-manifest";
import { createAttachmentBucketClientFactory, getAttachmentBucketMap } from "../bucket-routing";
import { buildAllAttachmentsUnavailableArchiveFailure } from "../failure-state";
import { getJsonObject, putJsonObject } from "../storage";
import {
  AttachmentArchiveCurrent,
  AttachmentArchiveManifest,
  AttachmentArchiveManifestAttachment,
  AttachmentArchivePackageManifest,
  AttachmentArchiveSectionManifest,
} from "../types";
import { isAllAttachmentsUnavailableArchive } from "./archive-outcome";
import { loadArchiveAttachment } from "./attachment-source";
import {
  classifyAttachmentArchiveAccessFailure,
  getAttachmentArchiveFailureState,
} from "./failure-classification";

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

type AttachmentBody = Buffer;

type SdkAttachmentBody = NonNullable<GetObjectCommandOutput["Body"]> & {
  transformToByteArray?: () => Promise<Uint8Array>;
};

async function consumeAttachmentBody(body: SdkAttachmentBody): Promise<Buffer> {
  if (typeof body.transformToByteArray === "function") {
    return Buffer.from(await body.transformToByteArray());
  }

  if (!isNodeReadableStream(body)) {
    throw new Error("Attachment body could not be consumed into a buffer");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as Readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
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

  return consumeAttachmentBody(response.Body);
}

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

async function markFailed(
  failure: Pick<
    AttachmentArchiveCurrent,
    | "blockedAttachment"
    | "errorMessage"
    | "failureCode"
    | "failureMessage"
    | "appendedAttachmentCount"
    | "skippedAttachmentCount"
  >,
): Promise<void> {
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
      appendedAttachmentCount: current?.appendedAttachmentCount,
      skippedAttachmentCount: current?.skippedAttachmentCount,
      executionArn: current?.executionArn,
      sectionId: current?.sectionId,
      sectionNumber: current?.sectionNumber,
      sectionLabel: current?.sectionLabel,
      sectionFolderName: current?.sectionFolderName,
      failureCode: failure.failureCode,
      failureMessage: failure.failureMessage,
      blockedAttachment: failure.blockedAttachment,
      errorMessage: failure.errorMessage,
    }),
  );
}

async function getAttachmentObjectTags(
  bucket: string,
  key: string,
): Promise<Record<string, string>> {
  const client = await getAttachmentBucketClient(bucket);
  const response = await client.send(
    new GetObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return (response.TagSet || []).reduce<Record<string, string>>((acc, tag) => {
    if (tag.Key && tag.Value) {
      acc[tag.Key] = tag.Value;
    }

    return acc;
  }, {});
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

const ATTACHMENT_PREFETCH_CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  if (items.length === 0) {
    return results;
  }

  const workerCount = Math.min(Math.max(concurrency, 1), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function loadAttachmentForArchive(
  attachment: AttachmentArchiveManifestAttachment,
): Promise<
  | { skipped: true }
  | { skipped: false; body: AttachmentBody; attachment: AttachmentArchiveManifestAttachment }
> {
  try {
    const result = await loadArchiveAttachment({
      attachment,
      attachmentBucketMap,
      consumer: "attachment_archive_worker",
      getAttachmentBody,
      getObjectTags: getAttachmentObjectTags,
    });

    if (result.skipped) {
      return { skipped: true };
    }

    return {
      skipped: false,
      body: result.body,
      attachment,
    };
  } catch (error) {
    const failure = await classifyAttachmentArchiveAccessFailure({
      attachment,
      error,
      getObjectTags: getAttachmentObjectTags,
    });

    if (failure) {
      throw Object.assign(new Error(failure.failureMessage), failure, {
        cause: error,
      });
    }

    throw error;
  }
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

  const loadedAttachments = await mapWithConcurrency(
    manifest.attachments,
    ATTACHMENT_PREFETCH_CONCURRENCY,
    (attachment) => loadAttachmentForArchive(attachment),
  );

  for (const loaded of loadedAttachments) {
    if (loaded.skipped) {
      skippedAttachmentCount += 1;
      continue;
    }

    archive.append(loaded.body, {
      name: pathResolver(loaded.attachment),
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
  options?: {
    appendedAttachmentCount?: number;
    blockedAttachment?: AttachmentArchiveCurrent["blockedAttachment"];
    errorMessage?: string;
    failureCode?: AttachmentArchiveCurrent["failureCode"];
    failureMessage?: AttachmentArchiveCurrent["failureMessage"];
    executionArn?: string;
    skippedAttachmentCount?: number;
  },
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
    appendedAttachmentCount: options?.appendedAttachmentCount,
    executionArn: options?.executionArn,
    sectionId: manifest.scope === "section" ? manifest.sectionId : undefined,
    sectionNumber: manifest.scope === "section" ? manifest.sectionNumber : undefined,
    sectionLabel: manifest.scope === "section" ? manifest.sectionLabel : undefined,
    sectionFolderName: manifest.scope === "section" ? manifest.sectionFolderName : undefined,
    skippedAttachmentCount: options?.skippedAttachmentCount,
    failureCode: options?.failureCode,
    failureMessage: options?.failureMessage,
    blockedAttachment: options?.blockedAttachment,
    errorMessage: options?.errorMessage,
  });
}

function isNodeReadableStream(value: unknown): value is NodeJS.ReadableStream {
  return !!value && typeof (value as NodeJS.ReadableStream).pipe === "function";
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

  await putCurrentArchiveStatus(
    buildCurrentFromManifest(manifest, "RUNNING", {
      executionArn: current.executionArn,
    }),
  );

  const archive = archiver("zip", { zlib: { level: 1 } });
  const tempArchivePath = join("/tmp", `attachment-archive-${hash}-${randomUUID()}.zip`);
  const archiveFileStream = createWriteStream(tempArchivePath);
  archive.on("warning", (error: Error) => {
    archiveFileStream.destroy(error);
  });
  archive.on("error", (error: Error) => {
    archiveFileStream.destroy(error);
  });

  archive.pipe(archiveFileStream);

  let builtArchive:
    | {
        manifest: AttachmentArchiveManifest;
        appendedAttachmentCount: number;
        skippedAttachmentCount: number;
      }
    | undefined;
  let allAttachmentsUnavailable = false;

  try {
    builtArchive = await buildArchiveFromManifest(archive, manifest);
    console.info(
      JSON.stringify({
        event: "attachment_archive_zip_build_completed",
        artifactKey,
        hash,
        manifestType: builtArchive.manifest.type,
        attachmentCount: builtArchive.appendedAttachmentCount,
        skippedAttachmentCount: builtArchive.skippedAttachmentCount,
        tempArchivePath,
      }),
    );
    if (
      isAllAttachmentsUnavailableArchive({
        appendedAttachmentCount: builtArchive.appendedAttachmentCount,
        skippedAttachmentCount: builtArchive.skippedAttachmentCount,
      })
    ) {
      allAttachmentsUnavailable = true;
      archive.abort();
      archiveFileStream.destroy();
    }

    if (!allAttachmentsUnavailable) {
      console.info(
        JSON.stringify({
          event: "attachment_archive_finalize_starting",
          artifactKey,
          hash,
          tempArchivePath,
        }),
      );
      await archive.finalize();
      console.info(
        JSON.stringify({
          event: "attachment_archive_finalize_completed",
          artifactKey,
          hash,
          tempArchivePath,
        }),
      );
      await finished(archiveFileStream);
      console.info(
        JSON.stringify({
          event: "attachment_archive_file_stream_completed",
          artifactKey,
          hash,
          tempArchivePath,
        }),
      );
      console.info(
        JSON.stringify({
          event: "attachment_archive_upload_starting",
          artifactKey,
          hash,
          tempArchivePath,
        }),
      );

      const upload = new Upload({
        client: archiveBucketClient,
        params: {
          Bucket: archiveBucketName,
          Key: artifactKey,
          Body: createReadStream(tempArchivePath),
          ContentType: "application/zip",
        },
      });
      await upload.done();
      console.info(
        JSON.stringify({
          event: "attachment_archive_upload_completed",
          artifactKey,
          hash,
        }),
      );
    }
  } finally {
    await fs.rm(tempArchivePath, { force: true }).catch(() => undefined);
  }

  if (!builtArchive) {
    throw new Error(`Attachment archive ${manifestKey} was not built`);
  }

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

  console.info(
    JSON.stringify({
      event: "attachment_archive_current_status_write_starting",
      artifactKey,
      hash,
      nextStatus: allAttachmentsUnavailable ? "FAILED" : "READY",
    }),
  );
  await putCurrentArchiveStatus(
    allAttachmentsUnavailable
      ? buildCurrentFromManifest(builtArchive.manifest, "FAILED", {
          appendedAttachmentCount: 0,
          executionArn: latestCurrent.executionArn,
          ...buildAllAttachmentsUnavailableArchiveFailure(builtArchive.manifest.scope),
          skippedAttachmentCount: builtArchive.skippedAttachmentCount,
        })
      : buildCurrentFromManifest(builtArchive.manifest, "READY", {
          appendedAttachmentCount: builtArchive.appendedAttachmentCount,
          executionArn: latestCurrent.executionArn,
          skippedAttachmentCount: builtArchive.skippedAttachmentCount,
        }),
  );
  console.info(
    JSON.stringify({
      event: "attachment_archive_current_status_write_completed",
      artifactKey,
      hash,
      nextStatus: allAttachmentsUnavailable ? "FAILED" : "READY",
    }),
  );

  console.info(
    JSON.stringify(
      allAttachmentsUnavailable
        ? {
            event: "attachment_archive_all_attachments_unavailable",
            artifactKey,
            hash,
            manifestType: builtArchive.manifest.type,
            skippedAttachmentCount: builtArchive.skippedAttachmentCount,
          }
        : {
            event: "attachment_archive_ready",
            artifactKey,
            hash,
            manifestType: builtArchive.manifest.type,
            attachmentCount: builtArchive.appendedAttachmentCount,
            skippedAttachmentCount: builtArchive.skippedAttachmentCount,
          },
    ),
  );
}

try {
  await run();
} catch (error) {
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
    await markFailed(getAttachmentArchiveFailureState(error));
  } catch (statusError) {
    console.error(
      JSON.stringify({
        event: "attachment_archive_failed_status_update_error",
        message: statusError instanceof Error ? statusError.message : String(statusError),
      }),
    );
  }

  process.exitCode = 1;
}
