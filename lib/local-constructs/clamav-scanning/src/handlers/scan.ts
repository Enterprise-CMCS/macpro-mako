import fs from "fs/promises";
import pino from "pino";

import {
  checkFileExt,
  checkFileSize,
  downloadAVDefinitions,
  downloadFileFromS3,
  extractBucketFromS3Event,
  extractKeyFromS3Event,
  scanLocalFile,
  startClamd,
  STATUS_CLEAN_FILE,
  STATUS_ERROR_PROCESSING_FILE,
  tagWithScanStatus,
} from "./../lib";
const logger = pino();

export function isTransientScanError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : `${error}`;
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined;

  return (
    code === "ENOSPC" ||
    message.includes("ENOSPC") ||
    message.includes("no space left on device")
  );
}

async function cleanupLocalDownload(fileLoc: string | undefined): Promise<void> {
  if (!fileLoc) {
    return;
  }

  try {
    await fs.unlink(fileLoc);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code)
        : undefined;
    if (code !== "ENOENT") {
      logger.error({ err: error, fileLoc }, "Failed to cleanup local download");
    }
  }
}

export async function handler(event: any): Promise<string[]> {
  logger.info("Download AV Definitions");
  await downloadAVDefinitions();

  logger.info("Starting ClamD");
  await startClamd();

  if (event.keepalive) {
    logger.info("Staying alive");
    return ["Staying alive"];
  }

  logger.info(`Start avScan with event ${JSON.stringify(event, null, 2)}`);

  const results: string[] = [];

  for (const record of event.Records) {
    let s3ObjectKey: string, s3ObjectBucket: string;
    try {
      const sqsMessageBody = JSON.parse(record.body);
      s3ObjectKey = extractKeyFromS3Event(sqsMessageBody);
      s3ObjectBucket = extractBucketFromS3Event(sqsMessageBody);
    } catch (error) {
      logger.error(`Error extracting data from record: ${JSON.stringify(record, null, 2)}` + error);
      results.push(STATUS_ERROR_PROCESSING_FILE);
      continue;
    }

    let virusScanStatus: string;
    let fileLoc: string | undefined;

    try {
      virusScanStatus = await checkFileSize(s3ObjectKey, s3ObjectBucket);
      if (virusScanStatus !== STATUS_CLEAN_FILE) {
        await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
        results.push(virusScanStatus);
        continue;
      }
      fileLoc = await downloadFileFromS3(s3ObjectKey, s3ObjectBucket);
      virusScanStatus = await checkFileExt(fileLoc);
      if (virusScanStatus !== STATUS_CLEAN_FILE) {
        await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
        results.push(virusScanStatus);
        continue;
      }
      virusScanStatus = (await scanLocalFile(fileLoc))!;
      await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
      results.push(virusScanStatus);
    } catch (error) {
      // Transient disk pressure should fail the invocation so SQS can retry on a
      // healthy environment instead of permanently tagging the object ERROR.
      if (isTransientScanError(error)) {
        logger.error({ err: error, s3ObjectBucket, s3ObjectKey }, "Transient scan failure");
        throw error;
      }

      virusScanStatus = STATUS_ERROR_PROCESSING_FILE;
      await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
      results.push(virusScanStatus);
    } finally {
      await cleanupLocalDownload(fileLoc);
    }
  }

  return results;
}
