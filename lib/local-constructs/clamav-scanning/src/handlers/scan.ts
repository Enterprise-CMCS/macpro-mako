import {
  startClamd,
  downloadAVDefinitions,
  scanLocalFile,
  extractKeyFromS3Event,
  extractBucketFromS3Event,
  STATUS_ERROR_PROCESSING_FILE,
  STATUS_SKIPPED_FILE,
  downloadFileFromS3,
  isS3FileTooBig,
  tagWithScanStatus,
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

    if (await isS3FileTooBig(s3ObjectKey, s3ObjectBucket)) {
      virusScanStatus = STATUS_SKIPPED_FILE;
      logger.info(`S3 File is too big. virusScanStatus=${virusScanStatus}`);
    } else {
      const fileLoc: string = await downloadFileFromS3(
        s3ObjectKey,
        s3ObjectBucket,
      );
      virusScanStatus = (await scanLocalFile(fileLoc))!;
    }

    await tagWithScanStatus(s3ObjectBucket, s3ObjectKey, virusScanStatus);
    results.push(virusScanStatus);
  }

  return results;
}
