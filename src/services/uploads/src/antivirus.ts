import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectTaggingCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import asyncfs from "fs/promises";

import { downloadAVDefinitions, scanLocalFile } from "./clamav";
import * as utils from "./utils";
import * as constants from "./constants";

const s3Client: S3Client = new S3Client();

export async function isS3FileTooBig(
  key: string,
  bucket: string
): Promise<boolean> {
  try {
    const res: HeadObjectCommandOutput = await s3Client.send(
      new HeadObjectCommand({ Key: key, Bucket: bucket })
    );
    return res.ContentLength > constants.MAX_FILE_SIZE;
  } catch (e) {
    utils.generateSystemMessage(
      `Error finding size of S3 Object: s3://${bucket}/${key}`
    );
    return false;
  }
}

async function downloadFileFromS3(
  s3ObjectKey: string,
  s3ObjectBucket: string
): Promise<string> {
  if (!fs.existsSync(constants.TMP_DOWNLOAD_PATH)) {
    fs.mkdirSync(constants.TMP_DOWNLOAD_PATH);
  }

  const localPath: string = `${constants.TMP_DOWNLOAD_PATH}${randomUUID()}.tmp`;
  const writeStream: fs.WriteStream = fs.createWriteStream(localPath);

  utils.generateSystemMessage(
    `Downloading file s3://${s3ObjectBucket}/${s3ObjectKey}`
  );

  const options = {
    Bucket: s3ObjectBucket,
    Key: s3ObjectKey,
  };

  try {
    const { Body } = await s3Client.send(new GetObjectCommand(options));
    await asyncfs.writeFile(localPath, Body);
    utils.generateSystemMessage(
      `Finished downloading new object ${s3ObjectKey}`
    );
    return localPath;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

const scanAndTagS3Object = async (
  s3ObjectKey: string,
  s3ObjectBucket: string
): Promise<string> => {
  utils.generateSystemMessage(
    `S3 Bucket and Key\n ${s3ObjectBucket}\n${s3ObjectKey}`
  );

  let virusScanStatus: string;

  if (await isS3FileTooBig(s3ObjectKey, s3ObjectBucket)) {
    virusScanStatus = constants.STATUS_SKIPPED_FILE;
    utils.generateSystemMessage(
      `S3 File is too big. virusScanStatus=${virusScanStatus}`
    );
  } else {
    utils.generateSystemMessage("Download AV Definitions");
    await downloadAVDefinitions();
    utils.generateSystemMessage("Download File from S3");
    const fileLoc: string = await downloadFileFromS3(
      s3ObjectKey,
      s3ObjectBucket
    );
    utils.generateSystemMessage("Set virusScanStatus");
    virusScanStatus = scanLocalFile(fileLoc);
    utils.generateSystemMessage(`virusScanStatus=${virusScanStatus}`);
  }

  const taggingParams = {
    Bucket: s3ObjectBucket,
    Key: s3ObjectKey,
    Tagging: utils.generateTagSet(virusScanStatus),
  };

  try {
    await s3Client.send(new PutObjectTaggingCommand(taggingParams));
    utils.generateSystemMessage("Tagging successful");
  } catch (err) {
    console.error(err);
  }

  return virusScanStatus;
};

export async function lambdaHandleEvent(event: any): Promise<string> {
  utils.generateSystemMessage(
    `Start avScan with event ${JSON.stringify(event, null, 2)}`
  );

  let s3ObjectKey: string, s3ObjectBucket: string;

  if (event.s3ObjectKey && event.s3ObjectBucket) {
    s3ObjectKey = event.s3ObjectKey;
    s3ObjectBucket = event.s3ObjectBucket;
  } else if (
    event.Records &&
    Array.isArray(event.Records) &&
    event.Records[0]?.eventSource === "aws:s3"
  ) {
    s3ObjectKey = utils.extractKeyFromS3Event(event);
    s3ObjectBucket = utils.extractBucketFromS3Event(event);
  } else {
    utils.generateSystemMessage(
      `Event missing s3ObjectKey or s3ObjectBucket: ${JSON.stringify(
        event,
        null,
        2
      )}`
    );
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }

  return await scanAndTagS3Object(s3ObjectKey, s3ObjectBucket);
}
