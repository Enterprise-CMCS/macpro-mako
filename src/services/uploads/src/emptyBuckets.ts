import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: process.env.region });

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData: any = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType === "Create" || event.RequestType === "Update") {
      console.log("This resource does nothing on Create and Update events.");
    } else if (event.RequestType === "Delete") {
      const buckets = event.ResourceProperties.Buckets;
      for (const bucket of buckets) {
        try {
          const objects = await listObjectVersions(bucket);
          await deleteObjectVersions(bucket, objects);
          console.log(
            `Successfully cleared all versions and delete markers in the S3 bucket: ${bucket}`
          );
        } catch (error) {
          console.error("Error in clearing the S3 bucket:", error);
          throw error; // Rethrowing the error indicates failure in Lambda execution
        }
      }
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};

async function listObjectVersions(
  bucketName: string
): Promise<DeletableObject[]> {
  let isTruncated = true;
  let keyMarker;
  let versionIdMarker;
  const objects: DeletableObject[] = [];

  while (isTruncated) {
    const params = {
      Bucket: bucketName,
      KeyMarker: keyMarker,
      VersionIdMarker: versionIdMarker,
    };
    const response = await s3Client.send(new ListObjectVersionsCommand(params));
    response.Versions?.forEach((version) =>
      objects.push({ Key: version.Key!, VersionId: version.VersionId })
    );
    response.DeleteMarkers?.forEach((marker) =>
      objects.push({ Key: marker.Key!, VersionId: marker.VersionId })
    );

    keyMarker = response.NextKeyMarker;
    versionIdMarker = response.NextVersionIdMarker;
    isTruncated = response.IsTruncated ?? false;
  }

  return objects;
}

type DeletableObject = {
  Key: string;
  VersionId?: string;
};

async function deleteObjectVersions(
  bucketName: string,
  objects: DeletableObject[]
) {
  if (objects.length === 0) return;

  for (let i = 0; i < objects.length; i += 1000) {
    const chunk = objects.slice(i, i + 1000);
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: chunk.map(({ Key, VersionId }) => ({ Key, VersionId })),
        Quiet: true,
      },
    };
    await s3Client.send(new DeleteObjectsCommand(deleteParams));
  }
}
