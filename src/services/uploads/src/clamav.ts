import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";
import fs from "fs";
import asyncfs from "fs/promises";
import * as constants from "./constants";
import * as utils from "./utils";
import { FileExtension, MimeType, fileTypeFromFile } from "file-type";

const s3Client: S3Client = new S3Client();

export async function listBucketFiles(bucketName: string): Promise<string[]> {
  try {
    const listFilesResult = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucketName })
    );
    if (listFilesResult.Contents) {
      const keys = listFilesResult.Contents.map((c) => c.Key) as string[];
      return keys;
    } else {
      return [];
    }
  } catch (err) {
    utils.generateSystemMessage("Error listing files");
    console.error(err);
    throw err;
  }
}

export const updateAVDefinitonsWithFreshclam = (): boolean => {
  try {
    const { stdout, stderr, error }: SpawnSyncReturns<Buffer> = spawnSync(
      `${constants.PATH_TO_FRESHCLAM}`,
      [
        `--config-file=${constants.FRESHCLAM_CONFIG}`,
        `--datadir=${constants.FRESHCLAM_WORK_DIR}`,
      ]
    );
    utils.generateSystemMessage("Update message");
    console.log(stdout.toString());

    console.log("Downloaded:", fs.readdirSync(constants.FRESHCLAM_WORK_DIR));

    if (stderr) {
      utils.generateSystemMessage("stderr");
      console.log(stderr.toString());
    }

    return true;
  } catch (err) {
    console.log("in the catch");
    console.log(err);
    return false;
  }
};

/**
 * Download the Antivirus definition from S3.
 * The definitions are stored on the local disk, ensure there's enough space.
 */
export const downloadAVDefinitions = async (): Promise<void[]> => {
  // list all the files in that bucket
  utils.generateSystemMessage("Downloading Definitions");
  const allFileKeys: string[] = await listBucketFiles(
    constants.CLAMAV_BUCKET_NAME
  );

  const definitionFileKeys: string[] = allFileKeys
    .filter((key) => key.startsWith(constants.PATH_TO_AV_DEFINITIONS))
    .map((fullPath) => path.basename(fullPath));

  // download each file in the bucket.
  const downloadPromises: Promise<void>[] = definitionFileKeys.map(
    (filenameToDownload) => {
      return new Promise<void>(async (resolve, reject) => {
        const destinationFile: string = path.join(
          constants.FRESHCLAM_WORK_DIR,
          filenameToDownload
        );

        utils.generateSystemMessage(
          `Downloading ${filenameToDownload} from S3 to ${destinationFile}`
        );

        const localFileWriteStream = fs.createWriteStream(destinationFile);

        const options = {
          Bucket: constants.CLAMAV_BUCKET_NAME,
          Key: `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToDownload}`,
        };

        try {
          const { Body } = await s3Client.send(new GetObjectCommand(options));
          await asyncfs.writeFile(destinationFile, Body);
          utils.generateSystemMessage(
            `Finished download ${filenameToDownload}`
          );
          resolve();
        } catch (err) {
          utils.generateSystemMessage(
            `Error downloading definition file ${filenameToDownload}`
          );
          console.log(err);
          reject();
        }
      });
    }
  );

  return await Promise.all(downloadPromises);
};

/**
 * Uploads the AV definitions to the S3 bucket.
 */
export const uploadAVDefinitions = async (): Promise<void[]> => {
  // delete all the definitions currently in the bucket.
  // first list them.
  utils.generateSystemMessage("Uploading Definitions");
  const s3AllFullKeys: string[] = await listBucketFiles(
    constants.CLAMAV_BUCKET_NAME
  );
  const s3DefinitionFileFullKeys: string[] = s3AllFullKeys.filter((key) =>
    key.startsWith(constants.PATH_TO_AV_DEFINITIONS)
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
        })
      );

      utils.generateSystemMessage(
        `Deleted extant definitions: ${s3DefinitionFileFullKeys}`
      );
    } catch (err) {
      utils.generateSystemMessage(
        `Error deleting current definition files: ${s3DefinitionFileFullKeys}`
      );
      console.log(err);
      throw err;
    }
  }

  // list all the files in the work dir for upload
  const definitionFiles: string[] = fs.readdirSync(
    constants.FRESHCLAM_WORK_DIR
  );

  const uploadPromises: Promise<void>[] = definitionFiles.map(
    (filenameToUpload) => {
      return new Promise<void>(async (resolve, reject) => {
        utils.generateSystemMessage(
          `Uploading updated definitions for file ${filenameToUpload} ---`
        );

        const options = {
          Bucket: constants.CLAMAV_BUCKET_NAME,
          Key: `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToUpload}`,
          Body: fs.readFileSync(
            path.join(constants.FRESHCLAM_WORK_DIR, filenameToUpload)
          ),
        };

        try {
          await s3Client.send(new PutObjectCommand(options));
          resolve();
          utils.generateSystemMessage(
            `--- Finished uploading ${filenameToUpload} ---`
          );
        } catch (err) {
          utils.generateSystemMessage(
            `--- Error uploading ${filenameToUpload} ---`
          );
          console.log(err);
          reject();
        }
      });
    }
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
  contentType: string | undefined
): Promise<string | null> => {
  try {
    if (!contentType) {
      utils.generateSystemMessage("FAILURE - EXTENSION UNKNOWN");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }
    let detectedContentType = await getFileTypeFromContents(pathToFile);
    if (detectedContentType) {
      console.log(`File declared extension:  ${contentType}`);
      console.log(`File detected extension:  ${detectedContentType}`);
      let same = areMimeTypesEquivalent(contentType, detectedContentType);
      if (!same) {
        utils.generateSystemMessage(
          `FAILURE - FILE EXTENSION DOES NOT MATCH FILE CONTENTS`
        );
        return constants.STATUS_EXTENSION_MISMATCH_FILE;
      }
    }

    const avResult: SpawnSyncReturns<Buffer> = spawnSync(
      constants.PATH_TO_CLAMAV,
      ["--stdout", "-v", "-a", "-d", constants.FRESHCLAM_WORK_DIR, pathToFile]
    );

    // status 1 means that the file is infected.
    if (avResult.status === 1) {
      utils.generateSystemMessage("SUCCESSFUL SCAN, FILE INFECTED");
      return constants.STATUS_INFECTED_FILE;
    } else if (avResult.status !== 0) {
      utils.generateSystemMessage("-- SCAN FAILED WITH ERROR --");
      console.error("stderror", avResult.stderr.toString());
      console.error("stdout", avResult.stdout.toString());
      console.error("err", avResult.error);
      return constants.STATUS_ERROR_PROCESSING_FILE;
    }

    utils.generateSystemMessage("SUCCESSFUL SCAN, FILE CLEAN");
    console.log(avResult.stdout.toString());

    return constants.STATUS_CLEAN_FILE;
  } catch (err) {
    utils.generateSystemMessage("-- SCAN FAILED --");
    console.log(err);
    return constants.STATUS_ERROR_PROCESSING_FILE;
  }
};

async function getFileTypeFromContents(
  filePath: string
): Promise<MimeType | null> {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);

    // Get the file type from its contents
    const type = await fileTypeFromFile(filePath);

    if (!type) {
      console.log("Could not determine file type.");
      return null;
    }
    console.log(`File type is ${type.mime} with extension ${type.ext}`);
    return type.mime;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

function areMimeTypesEquivalent(mime1: string, mime2: string): boolean {
  const equivalentTypes: { [key: string]: Set<string> } = {
    "application/rtf": new Set(["text/rtf"]),
    "application/vnd.ms-excel": new Set(["application/x-cfb"]),
    "application/vnd.ms-powerpoint": new Set(["application/x-cfb"]),
    "application/msword": new Set(["application/x-cfb", "application/rtf"]),
  };
  mime1 = mime1.toLowerCase();
  mime2 = mime2.toLowerCase();
  if (mime1 === mime2) {
    return true;
  }
  for (const baseType in equivalentTypes) {
    const equivalents = equivalentTypes[baseType];
    if (
      (mime1 === baseType && equivalents.has(mime2)) ||
      (mime2 === baseType && equivalents.has(mime1))
    ) {
      return true;
    }
  }
  return false;
}
