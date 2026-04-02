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

type AttachmentBody = NonNullable<GetObjectCommandOutput["Body"]>;
type ArchiverInput = Buffer | Readable;

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
    let result: Awaited<ReturnType<typeof loadArchiveAttachment<AttachmentBody>>>;

    try {
      result = await loadArchiveAttachment({
        attachment,
        attachmentBucketMap,
        consumer: "attachment_archive_worker",
        getAttachmentBody,
        getObjectTags: getAttachmentObjectTags,
      });
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

    if (result.skipped) {
      skippedAttachmentCount += 1;
      continue;
    }

    archive.append(toArchiverInput(result.body), {
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

function isWebReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return !!value && typeof (value as ReadableStream<Uint8Array>).getReader === "function";
}

function isAsyncIterableStream(value: unknown): value is AsyncIterable<Uint8Array> {
  return (
    !!value && typeof (value as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] === "function"
  );
}

function hasTransformToWebStream(body: AttachmentBody): body is AttachmentBody & {
  transformToWebStream: () => ReadableStream<Uint8Array>;
} {
  return typeof (body as { transformToWebStream?: unknown }).transformToWebStream === "function";
}

function toArchiverInput(body: AttachmentBody): ArchiverInput {
  if (isNodeReadableStream(body)) {
    return body as Readable;
  }

  if (hasTransformToWebStream(body)) {
    return Readable.fromWeb(body.transformToWebStream());
  }

  if (isWebReadableStream(body)) {
    return Readable.fromWeb(body);
  }

  if (isAsyncIterableStream(body)) {
    return Readable.from(body);
  }

  throw new Error("Attachment body could not be converted to a readable stream");
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

  const archive = archiver("zip", { zlib: { level: 9 } });
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
      await archive.finalize();
      await finished(archiveFileStream);
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
