import {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
  ObjectIdentifier,
  ObjectVersion,
  DeleteMarkerEntry,
  PutBucketPolicyCommand,
  GetBucketPolicyCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async function (event: any) {
  console.log("Request received:\n", JSON.stringify(event, null, 2));

  if (event.RequestType === "Delete") {
    const buckets = event.ResourceProperties.Buckets;
    for (const bucket of buckets) {
      await blockAllUploads(bucket);
      await deleteAllObjects(bucket);
    }
  }
};

async function blockAllUploads(bucket: string) {
  let existingPolicy;

  try {
    const getBucketPolicyParams = {
      Bucket: bucket,
    };
    const response = await s3.send(
      new GetBucketPolicyCommand(getBucketPolicyParams),
    );
    console.log(response);
    existingPolicy = response.Policy
      ? JSON.parse(response.Policy)
      : {
          Version: "2012-10-17",
          Statement: [],
        };
  } catch (error) {
    if (error.name === "NoSuchBucketPolicy") {
      existingPolicy = {
        Version: "2012-10-17",
        Statement: [],
      };
    } else {
      throw error;
    }
  }

  const newStatement = {
    Effect: "Deny",
    Principal: "*",
    Action: "s3:PutObject",
    Resource: `arn:aws:s3:::${bucket}/*`,
  };

  existingPolicy.Statement.push(newStatement);

  const putBucketPolicyParams = {
    Bucket: bucket,
    Policy: JSON.stringify(existingPolicy),
  };

  await s3.send(new PutBucketPolicyCommand(putBucketPolicyParams));
}

async function listAllObjects(bucket: string): Promise<ObjectIdentifier[]> {
  let contents: ObjectIdentifier[] = [];
  let isTruncated = true;
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;

  while (isTruncated) {
    const response = await s3.send(
      new ListObjectVersionsCommand({
        Bucket: bucket,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      }),
    );

    if (response.Versions) {
      contents = contents.concat(
        response.Versions.map((version: ObjectVersion) => ({
          Key: version.Key!,
          VersionId: version.VersionId,
        })),
      );
    }

    if (response.DeleteMarkers) {
      contents = contents.concat(
        response.DeleteMarkers.map((marker: DeleteMarkerEntry) => ({
          Key: marker.Key!,
          VersionId: marker.VersionId,
        })),
      );
    }

    isTruncated = response.IsTruncated!;
    keyMarker = response.NextKeyMarker;
    versionIdMarker = response.NextVersionIdMarker;
  }

  return contents;
}

async function deleteAllObjects(bucket: string) {
  const objects = await listAllObjects(bucket);

  const chunkSize = 1000; // Max 1000 objects per batch
  for (let i = 0; i < objects.length; i += chunkSize) {
    const chunk = objects.slice(i, i + chunkSize);
    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: chunk,
      },
    };
    await s3.send(new DeleteObjectsCommand(deleteParams));
  }
}
