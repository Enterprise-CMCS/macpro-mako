import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectTaggingCommand,
  HeadObjectCommandOutput,
  PutObjectTaggingCommandOutput,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import asyncfs from "fs/promises";
import pino from "pino";
const logger = pino();
import * as constants from "./constants";
import { Readable } from "stream";

const s3Client: S3Client = new S3Client();

export async function checkFileSize(
  key: string,
  bucket: string,
): Promise<string> {
  try {
    const res: HeadObjectCommandOutput = await s3Client.send(
      new HeadObjectCommand({ Key: key, Bucket: bucket }),
    );
    if (
      res.ContentLength === undefined ||
      res.ContentLength === null ||
      typeof res.ContentLength !== "number"
    ) {
      logger.info(
        `ContentLength is invalid for S3 Object: s3://${bucket}/${key}`,
      );
      return constants.STATUS_ERROR_PROCESSING_FILE;
    }
    return res.ContentLength > parseInt(constants.MAX_FILE_SIZE)
      ? constants.STATUS_TOO_BIG
      : constants.STATUS_CLEAN_FILE;
  } catch (e) {
    logger.info(`Error finding size of S3 Object: s3://${bucket}/${key}`);
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }
}

export async function downloadFileFromS3(
  s3ObjectKey: string,
  s3ObjectBucket: string,
): Promise<string> {
  if (!fs.existsSync(constants.TMP_DOWNLOAD_PATH)) {
    fs.mkdirSync(constants.TMP_DOWNLOAD_PATH);
  }

  const localPath: string = `${
    constants.TMP_DOWNLOAD_PATH
  }${randomUUID()}--${s3ObjectKey}`;
  const writeStream: fs.WriteStream = fs.createWriteStream(localPath);

  logger.info(`Downloading file s3://${s3ObjectBucket}/${s3ObjectKey}`);

  const options = {
    Bucket: s3ObjectBucket,
    Key: s3ObjectKey,
  };

  try {
    const { Body } = await s3Client.send(new GetObjectCommand(options));
    if (!Body || !(Body instanceof Readable)) {
      throw new Error("Invalid Body type received from S3");
    }
    await asyncfs.writeFile(localPath, Body);
    logger.info(`Finished downloading new object ${s3ObjectKey}`);
    return localPath;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

export async function tagWithScanStatus(
  bucket: string,
  key: string,
  virusScanStatus: string,
): Promise<void> {
  try {
    const res: PutObjectTaggingCommandOutput = await s3Client.send(
      new PutObjectTaggingCommand({
        Bucket: bucket,
        Key: key,
        Tagging: {
          TagSet: [
            {
              Key: constants.VIRUS_SCAN_STATUS_KEY,
              Value: virusScanStatus,
            },
            {
              Key: constants.VIRUS_SCAN_TIMESTAMP_KEY,
              Value: new Date().getTime().toString(),
            },
          ],
        },
      }),
    );
    logger.info("Tagging successful");
  } catch (err) {
    logger.error(err);
  }
}

export async function listBucketFiles(bucketName: string): Promise<string[]> {
  try {
    const listFilesResult = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName }),
    );
    if (listFilesResult.Contents) {
      const keys = listFilesResult.Contents.map((c) => c.Key) as string[];
      return keys;
    } else {
      return [];
    }
  } catch (err) {
    logger.info("Error listing files");
    logger.error(err);
    throw err;
  }
}
