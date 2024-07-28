import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectTaggingCommand,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import asyncfs from "fs/promises";

import { downloadAVDefinitions, scanLocalFile } from "./lib/clamav";
import * as utils from "./lib/utils";
import * as constants from "./lib/constants";
import pino from "pino";
const logger = pino();

import { exec, spawn } from "child_process";

const s3Client: S3Client = new S3Client();

const CLAMD_SOCKET = "/tmp/clamd.ctl";
const MAX_WAIT_TIME = 30000; // 30 seconds
const SLEEP_INTERVAL = 1000; // 1 second

export async function startClamd() {
  return new Promise<void>((resolve, reject) => {
    // Check if clamd is already running
    if (fs.existsSync(CLAMD_SOCKET)) {
      logger.info("clamd is already running.");
      resolve();
      return;
    }

    logger.info("Starting clamd...");
    const clamd = spawn("/usr/sbin/clamd");

    clamd.on("error", (err) => {
      logger.error(`Failed to start clamd: ${err.message}`);
      reject(err);
    });

    clamd.stdout.on("data", (data) => {
      logger.info(`clamd stdout: ${data}`);
    });

    clamd.stderr.on("data", (data) => {
      logger.error(`clamd stderr: ${data}`);
    });

    let timePassed = 0;

    const checkClamdReady = setInterval(() => {
      if (fs.existsSync(CLAMD_SOCKET)) {
        logger.info("clamd socket found, verifying clamd is ready...");

        // Test if clamd is ready by scanning a small file
        const testFilePath = "/tmp/testfile.txt";
        fs.writeFileSync(testFilePath, "SCAN ME");

        exec(`clamdscan --fdpass ${testFilePath}`, (error, stdout, stderr) => {
          if (error) {
            logger.error(`clamdscan error: ${stderr}`);
          } else if (stdout.includes("OK")) {
            clearInterval(checkClamdReady);
            fs.unlinkSync(testFilePath);
            logger.info("clamd is up and running!");
            resolve();
          } else {
            logger.info("clamd is not ready yet.");
          }
        });
      }

      timePassed += SLEEP_INTERVAL;

      if (timePassed >= MAX_WAIT_TIME) {
        clearInterval(checkClamdReady);
        reject(
          new Error(
            "clamd did not become fully operational within 30 seconds.",
          ),
        );
      }
    }, SLEEP_INTERVAL);
  });
}

export async function handler(event: any): Promise<string> {
  logger.info("Download AV Definitions");
  await downloadAVDefinitions();

  logger.info("Starting ClamD");
  await startClamd();

  if (event.keepalive) {
    logger.info("Staying alive");
    return "Staying alive";
  }

  logger.info(`Start avScan with event ${JSON.stringify(event, null, 2)}`);

  let s3ObjectKey: string, s3ObjectBucket: string;
  if (event.s3ObjectKey && event.s3ObjectBucket) {
    s3ObjectKey = event.s3ObjectKey;
    s3ObjectBucket = event.s3ObjectBucket;
  } else if (
    event.Records &&
    Array.isArray(event.Records) &&
    event.Records[0]?.eventSource === "aws:sqs"
  ) {
    // Extract the S3 event from the SQS message
    const sqsMessageBody = JSON.parse(event.Records[0].body);
    if (
      sqsMessageBody.Records &&
      Array.isArray(sqsMessageBody.Records) &&
      sqsMessageBody.Records[0]?.eventSource === "aws:s3"
    ) {
      s3ObjectKey = utils.extractKeyFromS3Event(sqsMessageBody);
      s3ObjectBucket = utils.extractBucketFromS3Event(sqsMessageBody);
    } else {
      logger.info(
        `Event missing s3ObjectKey or s3ObjectBucket: ${JSON.stringify(
          sqsMessageBody,
          null,
          2,
        )}`,
      );
      return constants.STATUS_ERROR_PROCESSING_FILE;
    }
  } else {
    logger.info(
      `Event missing s3ObjectKey or s3ObjectBucket: ${JSON.stringify(
        event,
        null,
        2,
      )}`,
    );
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }

  return await scanAndTagS3Object(s3ObjectKey, s3ObjectBucket);
}

export async function isS3FileTooBig(
  key: string,
  bucket: string,
): Promise<boolean> {
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
      return false; // Or handle accordingly
    }
    return res.ContentLength > parseInt(constants.MAX_FILE_SIZE);
  } catch (e) {
    logger.info(`Error finding size of S3 Object: s3://${bucket}/${key}`);
    return true;
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
    await asyncfs.writeFile(localPath, Body);
    logger.info(`Finished downloading new object ${s3ObjectKey}`);
    return localPath;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

const scanAndTagS3Object = async (
  s3ObjectKey: string,
  s3ObjectBucket: string,
): Promise<string> => {
  logger.info(`S3 Bucket and Key\n ${s3ObjectBucket}\n${s3ObjectKey}`);

  let virusScanStatus: string;

  if (await isS3FileTooBig(s3ObjectKey, s3ObjectBucket)) {
    virusScanStatus = constants.STATUS_SKIPPED_FILE;
    logger.info(`S3 File is too big. virusScanStatus=${virusScanStatus}`);
  } else {
    logger.info("Download File from S3");
    const fileLoc: string = await downloadFileFromS3(
      s3ObjectKey,
      s3ObjectBucket,
    );
    logger.info("Set virusScanStatus");
    virusScanStatus = (await scanLocalFile(fileLoc))!;
    logger.info(`virusScanStatus=${virusScanStatus}`);
  }

  const taggingParams = {
    Bucket: s3ObjectBucket,
    Key: s3ObjectKey,
    Tagging: utils.generateTagSet(virusScanStatus),
  };

  try {
    await s3Client.send(new PutObjectTaggingCommand(taggingParams));
    logger.info("Tagging successful");
  } catch (err) {
    logger.error(err);
  }

  return virusScanStatus;
};
