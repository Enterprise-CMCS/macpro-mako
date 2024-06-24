import {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
  ObjectIdentifier,
  ObjectVersion,
  DeleteMarkerEntry,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async function (event: any, context: any) {
  console.log("Request received:\n", JSON.stringify(event, null, 2));

  // This lambda's event types should be handled in the custom resource framework
  // However, let's leave this here as a safeguard against misconfiguration.
  if (event.RequestType === "Delete") {
    const buckets = event.ResourceProperties.Buckets;
    for (const bucket of buckets) {
      await deleteAllObjects(bucket);
    }
  }
};

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
      })
    );

    if (response.Versions) {
      contents = contents.concat(
        response.Versions.map((version: ObjectVersion) => ({
          Key: version.Key!,
          VersionId: version.VersionId,
        }))
      );
    }

    if (response.DeleteMarkers) {
      contents = contents.concat(
        response.DeleteMarkers.map((marker: DeleteMarkerEntry) => ({
          Key: marker.Key!,
          VersionId: marker.VersionId,
        }))
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
