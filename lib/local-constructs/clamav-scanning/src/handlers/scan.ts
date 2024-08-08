import {
  startClamd,
  downloadAVDefinitions,
  scanLocalFile,
  extractKeyFromS3Event,
  extractBucketFromS3Event,
  STATUS_ERROR_PROCESSING_FILE,
  downloadFileFromS3,
  tagWithScanStatus,
  checkFileExt,
  STATUS_CLEAN_FILE,
  checkFileSize,
} from "./../lib";
import pino from "pino";
const logger = pino();

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
      logger.error(
        `Error extracting data from record: ${JSON.stringify(
          record,
          null,
          2,
        )}` + error,
      );
      results.push(STATUS_ERROR_PROCESSING_FILE);
      continue;
    }

    let virusScanStatus: string;

    try {
      virusScanStatus = await checkFileSize(s3ObjectKey, s3ObjectBucket);
      if (virusScanStatus !== STATUS_CLEAN_FILE) {
        await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
        results.push(virusScanStatus);
        continue;
      }
      const fileLoc: string = await downloadFileFromS3(
        s3ObjectKey,
        s3ObjectBucket,
      );
      virusScanStatus = await checkFileExt(fileLoc);
      if (virusScanStatus !== STATUS_CLEAN_FILE) {
        await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
        results.push(virusScanStatus);
        continue;
      }
      virusScanStatus = (await scanLocalFile(fileLoc))!;
      await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
      results.push(virusScanStatus);
    } catch {
      virusScanStatus = STATUS_ERROR_PROCESSING_FILE;
      await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
      results.push(virusScanStatus);
    }

    await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
    results.push(virusScanStatus);
  }

  return results;
}
