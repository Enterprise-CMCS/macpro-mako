import { execSync } from "child_process";

/**
 * Cleanup the specific S3 folder by removing all of its content.
 * We need that to cleanup the /tmp/ folder after the download of the definitions.
 */
export function cleanupFolder(folderToClean: string): void {
  let result: Buffer = execSync(`ls -l ${folderToClean}`);
  // console.log(result.toString());
  console.log("-- Folder before cleanup--");
  console.log(result.toString());

  execSync(`rm -rf ${folderToClean}*`);

  result = execSync(`ls -l ${folderToClean}`);

  console.log("-- Folder after cleanup --");
  console.log(result.toString());
}

/**
 * Extract the body from an SQS message and parse it as JSON.
 * @param sqsEvent Inbound SQS event.
 * @return {any} Parsed S3 event.
 */
export function extractS3EventFromSQSEvent(sqsEvent: any): any {
  try {
    const sqsMessageBody: string = sqsEvent["Records"][0]["body"];
    const s3Event = JSON.parse(sqsMessageBody);
    return s3Event;
  } catch {
    throw new Error("Unable to retrieve body from the SQS event");
  }
}

/**
 * Extract the key from an S3 event.
 * @param s3Event Inbound S3 event.
 * @return {string} Key
 */
export function extractKeyFromS3Event(s3Event: any): string {
  try {
    const key: string = s3Event["Records"][0]["s3"]["object"]["key"];
    return decodeURIComponent(key).replace(/\+/g, " ");
  } catch {
    throw new Error("Unable to retrieve key information from the event");
  }
}

/**
 * Extract the bucket from an S3 event.
 * @param s3Event Inbound S3 event.
 * @return {string} Bucket
 */
export function extractBucketFromS3Event(s3Event: any): string {
  try {
    const bucketName: string = s3Event["Records"][0]["s3"]["bucket"]["name"];
    return bucketName;
  } catch {
    throw new Error("Unable to retrieve bucket information from the event");
  }
}
