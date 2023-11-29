import { execSync } from "child_process";

import * as constants from "./constants";

interface TagSet {
  TagSet: Tag[];
}

interface Tag {
  Key: string;
  Value: string;
}

/**
 * Generates the set of tags that will be used to tag the files of S3.
 * @param virusScanStatus String representing the status.
 * @return {{TagSet: *[]}} TagSet ready to be attached to an S3 file.
 */
export function generateTagSet(virusScanStatus: string): TagSet {
  return {
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
  };
}

/**
 * Cleanup the specific S3 folder by removing all of its content.
 * We need that to cleanup the /tmp/ folder after the download of the definitions.
 */
export function cleanupFolder(folderToClean: string): void {
  let result: Buffer = execSync(`ls -l ${folderToClean}`);

  console.log("-- Folder before cleanup--");
  console.log(result.toString());

  execSync(`rm -rf ${folderToClean}*`);

  result = execSync(`ls -l ${folderToClean}`);

  console.log("-- Folder after cleanup --");
  console.log(result.toString());
}

/**
 * Extract the key from an S3 event.
 * @param s3Event Inbound S3 event.
 * @return {string} decoded key.
 */
export function extractKeyFromS3Event(s3Event: any): string {
  const key: string = s3Event["Records"][0]["s3"]["object"]["key"];

  if (!key) {
    throw new Error("Unable to retrieve key information from the event");
  }

  return decodeURIComponent(key).replace(/\+/g, " ");
}

/**
 * Extract the bucket from an S3 event.
 * @param s3Event Inbound S3 event.
 * @return {string} Bucket
 */
export function extractBucketFromS3Event(s3Event: any): string {
  const bucketName: string = s3Event["Records"][0]["s3"]["bucket"]["name"];

  if (!bucketName) {
    throw new Error("Unable to retrieve bucket information from the event");
  }

  return bucketName;
}

/**
 * Generates & logs a system message (simple --- the message here ---)
 * @param systemMessage Inbound message to log and generate.
 * @return {string} Formatted message.
 */
export function generateSystemMessage(systemMessage: string): string {
  const finalMessage: string = `--- ${systemMessage} ---`;
  console.log(finalMessage);
  return finalMessage;
}
