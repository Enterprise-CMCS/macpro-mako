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
import readline from "readline";
import asyncfs from "fs/promises";
import * as constants from "./constants";
import * as utils from "./utils";
import { FileExtension, MimeType, fileTypeFromFile } from "file-type";
import { lookup } from "mime-types";
import pino from "pino";
const logger = pino();

const s3Client: S3Client = new S3Client();

export type FileTypeInfo = {
  extension: string;
  description: string;
  mime: string;
};

export const FILE_TYPES: FileTypeInfo[] = [
  { extension: ".bmp", description: "Bitmap Image File", mime: "image/bmp" },
  {
    extension: ".csv",
    description: "Comma-separated Values",
    mime: "text/csv",
  },
  {
    extension: ".doc",
    description: "MS Word Document",
    mime: "application/msword",
  },
  {
    extension: ".docx",
    description: "MS Word Document (xml)",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    extension: ".gif",
    description: "Graphics Interchange Format",
    mime: "image/gif",
  },
  {
    extension: ".jpeg",
    description: "Joint Photographic Experts Group",
    mime: "image/jpeg",
  },
  {
    extension: ".odp",
    description: "OpenDocument Presentation (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.presentation",
  },
  {
    extension: ".ods",
    description: "OpenDocument Spreadsheet (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.spreadsheet",
  },
  {
    extension: ".odt",
    description: "OpenDocument Text (OpenOffice)",
    mime: "application/vnd.oasis.opendocument.text",
  },
  {
    extension: ".png",
    description: "Portable Network Graphic",
    mime: "image/png",
  },
  {
    extension: ".pdf",
    description: "Portable Document Format",
    mime: "application/pdf",
  },
  {
    extension: ".ppt",
    description: "MS Powerpoint File",
    mime: "application/vnd.ms-powerpoint",
  },
  {
    extension: ".pptx",
    description: "MS Powerpoint File (xml)",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    extension: ".rtf",
    description: "Rich Text Format",
    mime: "application/rtf",
  },
  { extension: ".tif", description: "Tagged Image Format", mime: "image/tiff" },
  { extension: ".txt", description: "Text File Format", mime: "text/plain" },
  {
    extension: ".xls",
    description: "MS Excel File",
    mime: "application/vnd.ms-excel",
  },
  {
    extension: ".xlsx",
    description: "MS Excel File (xml)",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
];

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

async function looksLikeCsv(
  filePath: string,
  delimiter: string = ",",
  maxLinesToCheck: number = 10,
): Promise<boolean> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let previousNumberOfFields = 0;

  for await (const line of rl) {
    lineNumber++;

    // Skip empty lines
    if (line.trim() === "") continue;

    const fields = line.split(delimiter);

    // Check if the number of fields is consistent across rows
    if (lineNumber > 1 && fields.length !== previousNumberOfFields) {
      return false;
    }

    previousNumberOfFields = fields.length;

    if (lineNumber >= maxLinesToCheck) {
      break;
    }
  }

  return true;
}

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
    // Calculate the mime type based off the extension.
    let mimeTypeFromExtension = lookup(path.extname(pathToFile));

    // Error out if mimeTypes couldn't figure out the mime type.
    if (!mimeTypeFromExtension) {
      logger.info("FAILURE - CANNOT DETERMINE MIMETYPE FROM EXTENSION");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Error out if the extension is not allowed
    if (!isAllowedMime(mimeTypeFromExtension)) {
      logger.info("FAILURE - EXTENSION IS NOT OF AN ALLOWED TYPE");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Caclulate the mime type based off the file's contents.
    let mimeTypeFromContents = await getFileTypeFromContents(pathToFile);
    // Error out if file-type couldn't determine the mime type.
    if (!mimeTypeFromContents) {
      logger.info("FAILURE - CANNOT DETERMINE MIMETYPE FROM CONTENTS");
      return constants.STATUS_UNKNOWN_EXTENSION;
    }

    // Log
    logger.info(`File mimetype from extension:  ${mimeTypeFromExtension}`);
    logger.info(`File mimetype from contents:   ${mimeTypeFromContents}`);

    // Check if the mimes are equivalent
    let same = areMimeTypesEquivalent(
      mimeTypeFromExtension,
      mimeTypeFromContents,
    );
    // Error out if we can't determine equivalence
    if (!same) {
      logger.info(
        `FAILURE - MIMETYPE CALCULATED FROM EXTENSION DOES NOT MATCH MIMETYPE CALCULATED FROM CONTENTS`,
      );
      return constants.STATUS_EXTENSION_MISMATCH_FILE;
    }

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

function isAllowedMime(mime: string): boolean {
  return FILE_TYPES.some((fileType) => fileType.mime === mime);
}

async function getFileTypeFromContents(
  filePath: string,
): Promise<MimeType | false> {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);

    // Get the file type from its contents
    const type = await fileTypeFromFile(filePath);

    if (!type) {
      switch (path.extname(filePath)) {
        case ".csv":
          logger.info("Checking csv another way...");
          if (await looksLikeCsv(filePath, ",", 100)) {
            return lookup(".csv");
          }
          break;
        case ".txt":
          logger.info("Checking txt another way...");
          if (await looksLikeTxt(fileBuffer)) {
            return lookup(".txt");
          }
          break;
        default:
          logger.info("Could not determine file type.");
          return false;
      }
    }
    if (!type?.mime) {
      logger.info(
        `getFileTypeFromContents: File determined to be mime:${type?.mime}`,
      );
      return false;
    }
    logger.info(
      `getFileTypeFromContents:  File determined to be mime:${type.mime} ext:${type.ext}`,
    );
    return type.mime;
  } catch (error) {
    console.error("Error reading file:", error);
    return false;
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
    logger.info("Mime types not identical... checking AKAs for equivalence...");
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

function looksLikeTxt(buffer: Buffer): boolean {
  return !buffer.some((byte) => {
    return (
      byte < 0x09 ||
      (byte > 0x0d && byte < 0x20) || // Control characters excluding tab, newline, and carriage return
      byte > 0x7e // Beyond ASCII printable characters
    );
  });
}

function logBuffer(buffer: Buffer | null): string {
  if (!buffer) return "";
  return buffer.toString("utf-8");
}
