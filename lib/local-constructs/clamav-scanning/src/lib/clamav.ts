import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";
import fs from "fs";
import asyncfs from "fs/promises";
import * as constants from "./constants";
import pino from "pino";
import { Readable } from "stream";
import { listBucketFiles } from "./s3";
const logger = pino();

const s3Client: S3Client = new S3Client();

export const updateAVDefinitonsWithFreshclam = (): boolean => {
  try {
    const { stdout, stderr, error }: SpawnSyncReturns<Buffer> = spawnSync(
      `${constants.PATH_TO_FRESHCLAM}`,
      [
        `--config-file=${constants.FRESHCLAM_CONFIG}`,
        `--datadir=${constants.FRESHCLAM_WORK_DIR}`,
      ],
    );
    logger.info("Update message");
    logger.info(stdout.toString());

    logger.info("Downloaded:", fs.readdirSync(constants.FRESHCLAM_WORK_DIR));

    if (stderr) {
      logger.error("stderr");
      logger.info(stderr.toString());
    }

    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

export const downloadAVDefinitions = async (): Promise<void[]> => {
  // Check if the definitions folder is empty
  const files = await asyncfs.readdir(constants.FRESHCLAM_WORK_DIR);
  if (files.length > 0) {
    logger.info("AV definitions folder is not empty. Skipping download.");
    return Promise.resolve([]);
  }

  // List all the files in the bucket
  logger.info("Downloading Definitions");
  const allFileKeys: string[] = await listBucketFiles(
    constants.CLAMAV_BUCKET_NAME,
  );

  const definitionFileKeys: string[] = allFileKeys
    .filter((key) => key.startsWith(constants.PATH_TO_AV_DEFINITIONS))
    .map((fullPath) => path.basename(fullPath));

  // Download each file in the bucket
  const downloadPromises: Promise<void>[] = definitionFileKeys.map(
    (filenameToDownload) => {
      return new Promise<void>(async (resolve, reject) => {
        const destinationFile: string = path.join(
          constants.FRESHCLAM_WORK_DIR,
          filenameToDownload,
        );

        logger.info(
          `Downloading ${filenameToDownload} from S3 to ${destinationFile}`,
        );

        const options = {
          Bucket: constants.CLAMAV_BUCKET_NAME,
          Key: `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToDownload}`,
        };

        try {
          const { Body } = await s3Client.send(new GetObjectCommand(options));
          if (!Body || !(Body instanceof Readable)) {
            throw new Error("Invalid Body type received from S3");
          }
          await asyncfs.writeFile(destinationFile, Body);
          logger.info(`Finished download ${filenameToDownload}`);
          resolve();
        } catch (err) {
          logger.info(
            `Error downloading definition file ${filenameToDownload}`,
          );
          logger.error(err);
          reject();
        }
      });
    },
  );

  return await Promise.all(downloadPromises);
};

/**
 * Uploads the AV definitions to the S3 bucket.
 */
export const uploadAVDefinitions = async (): Promise<void[]> => {
  // delete all the definitions currently in the bucket.
  // first list them.
  logger.info("Uploading Definitions");
  const s3AllFullKeys: string[] = await listBucketFiles(
    constants.CLAMAV_BUCKET_NAME,
  );
  const s3DefinitionFileFullKeys: string[] = s3AllFullKeys.filter((key) =>
    key.startsWith(constants.PATH_TO_AV_DEFINITIONS),
  );

  // If there are any s3 Definition files in the s3 bucket, delete them.
  if (s3DefinitionFileFullKeys && s3DefinitionFileFullKeys.length !== 0) {
    try {
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: constants.CLAMAV_BUCKET_NAME,
          Delete: {
            Objects: s3DefinitionFileFullKeys.map((k) => {
              return { Key: k };
            }),
          },
        }),
      );

      logger.info(`Deleted extant definitions: ${s3DefinitionFileFullKeys}`);
    } catch (err) {
      logger.info(
        `Error deleting current definition files: ${s3DefinitionFileFullKeys}`,
      );
      logger.info(err);
      throw err;
    }
  }

  // list all the files in the work dir for upload
  const definitionFiles: string[] = fs.readdirSync(
    constants.FRESHCLAM_WORK_DIR,
  );

  const uploadPromises: Promise<void>[] = definitionFiles.map(
    (filenameToUpload) => {
      return new Promise<void>(async (resolve, reject) => {
        logger.info(
          `Uploading updated definitions for file ${filenameToUpload} ---`,
        );

        const options = {
          Bucket: constants.CLAMAV_BUCKET_NAME,
          Key: `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToUpload}`,
          Body: fs.readFileSync(
            path.join(constants.FRESHCLAM_WORK_DIR, filenameToUpload),
          ),
        };

        try {
          await s3Client.send(new PutObjectCommand(options));
          resolve();
          logger.info(`--- Finished uploading ${filenameToUpload} ---`);
        } catch (err) {
          logger.info(`--- Error uploading ${filenameToUpload} ---`);
          logger.info(err);
          reject();
        }
      });
    },
  );

  return await Promise.all(uploadPromises);
};

/**
 * Function to scan the given file. This function requires ClamAV and the definitions to be available.
 * This function does not download the file so the file should also be accessible.
 *
 * Three possible case can happen:
 * - The file is clean, the clamAV command returns 0 and the function return "CLEAN"
 * - The file is infected, the clamAV command returns 1 and this function will return "INFECTED"
 * - Any other error and the function will return null; (falsey)
 *
 * @param pathToFile Path in the filesystem where the file is stored.
 */
export const scanLocalFile = async (
  pathToFile: string,
): Promise<string | null> => {
  try {
    const avResult: SpawnSyncReturns<string> = spawnSync(
      "clamdscan",
      ["--fdpass", "--stdout", "-v", pathToFile],
      { encoding: "utf-8" },
    );

    // status 1 means that the file is infected.
    if (avResult.status === 1) {
      logger.info("SUCCESSFUL SCAN, FILE INFECTED");
      return constants.STATUS_INFECTED_FILE;
    } else if (avResult.status !== 0) {
      logger.info("-- SCAN FAILED WITH ERROR --");
      logger.info(avResult.stdout);
      logger.info(avResult.stderr);
      return constants.STATUS_ERROR_PROCESSING_FILE;
    }

    logger.info("SUCCESSFUL SCAN, FILE CLEAN");
    logger.info(avResult.stdout);

    return constants.STATUS_CLEAN_FILE;
  } catch (err) {
    logger.info("-- SCAN FAILED --");
    logger.info(err);
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }
};
