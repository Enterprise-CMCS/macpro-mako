import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getStateFilter } from "../libs/auth/user";
import { getPackage, getPackageChangelog } from "../libs/package";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to get Seatool data
export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  if (!process.env.osDomain) {
    return response({
      statusCode: 500,
      body: { message: "Handler is missing process.env.osDomain env var" },
    });
  }

  try {
    const body = JSON.parse(event.body);

    const mainResult = await getPackage(body.id);
    if (!mainResult) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      const stateAccessAllowed = stateFilter?.terms.state.includes(
        mainResult?._source?.state?.toLocaleLowerCase() || ""
      );

      if (!stateAccessAllowed) {
        return response({
          statusCode: 404,
          body: { message: "state access not permitted for the given id" },
        });
      }
    }

    // add state
    // Do we want to check
    const changelogs = await getPackageChangelog(body.id);
    const attachmentExists = changelogs.hits.hits.some((CL) => {
      return CL._source.attachments?.some(
        (ATT) => ATT.bucket === body.bucket && ATT.key === body.key
      );
    });
    if (!attachmentExists) {
      return response({
        statusCode: 500,
        body: {
          message: "Attachment details not found for given record id.",
        },
      });
    }

    // Now we can generate the presigned url
    const url = await generatePresignedUrl(
      body.bucket,
      body.key,
      body.filename,
      60
    );

    return response<unknown>({
      statusCode: 200,
      body: { url },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

async function getClient(bucket: string) {
  if (bucket.startsWith("uploads")) {
    const stsClient = new STSClient({});

    // Assume the role
    const assumedRoleResponse = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: process.env.onemacLegacyS3AccessRoleArn,
        RoleSessionName: "AssumedRoleSession",
      })
    );

    // Extract the assumed role credentials
    const assumedCredentials = assumedRoleResponse.Credentials;

    if (!assumedCredentials) {
      throw new Error("No assumed redentials");
    }

    // Create S3 client using the assumed role's credentials
    return new S3Client({
      credentials: {
        accessKeyId: assumedCredentials.AccessKeyId as string,
        secretAccessKey: assumedCredentials.SecretAccessKey as string,
        sessionToken: assumedCredentials.SessionToken,
      },
    });
  } else {
    return new S3Client({});
  }
}

//TODO: add check for resource before signing URL
async function generatePresignedUrl(
  bucket: string,
  key: string,
  filename: string,
  expirationInSeconds: number
) {
  // Get an S3 client
  const client = await getClient(bucket);

  // Create a command to get the object (you can adjust this according to your use case)
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `filename ="${filename}"`,
  });

  // Generate a presigned URL
  const presignedUrl = await getSignedUrl(client, getObjectCommand, {
    expiresIn: expirationInSeconds,
  });

  return presignedUrl;
}
