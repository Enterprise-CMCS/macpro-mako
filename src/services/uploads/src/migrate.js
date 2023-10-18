import {
  S3Client,
  ListObjectsV2Command,
  PutObjectAclCommand,
} from "@aws-sdk/client-s3";

import { ATTACHMENTS_BUCKET } from "./constants";

const s3Client = new S3Client();

export async function removePublicRead() {
  let hasMoreResults = true;
  let nextToken;
  const putAclPromises = [];

  while (hasMoreResults) {
    const { Contents, IsTruncated, NextContinuationToken } =
      await s3Client.send(
        new ListObjectsV2Command({
          Bucket: ATTACHMENTS_BUCKET,
          ContinuationToken: nextToken,
        })
      );

    hasMoreResults = IsTruncated;
    nextToken = NextContinuationToken;

    for (const { Key } of Contents) {
      putAclPromises.push(
        s3Client.send(
          new PutObjectAclCommand({
            Bucket: ATTACHMENTS_BUCKET,
            Key,
            ACL: "private",
          })
        )
      );
    }
  }

  await Promise.all(putAclPromises);
}
