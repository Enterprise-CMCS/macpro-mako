import { handleOpensearchError } from "./utils";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getStateFilter } from "../libs/api/auth/user";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { getDomain } from "libs/utils";

// Handler function to get Seatool data
export const handler = async (event: APIGatewayEvent) => {
  try {
    getDomain();
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: `ERROR: ${error?.message || error}` },
    });
  }

  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const body = JSON.parse(event.body);

    const mainResult = await getPackage(body.id);
    if (!mainResult || !mainResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      const stateAccessAllowed = stateFilter?.terms.state.includes(
        mainResult?._source?.state?.toLocaleLowerCase() || "",
      );

      if (!stateAccessAllowed) {
        return response({
          statusCode: 403,
          body: { message: "state access not permitted for the given id" },
        });
      }
    }

    // add state
    // Do we want to check
    const changelogs = await getPackageChangelog(body.id);
    const attachmentExists = changelogs.hits.hits.some((CL) => {
      return CL._source.attachments?.some(
        (ATT) => ATT.bucket === body.bucket && ATT.key === body.key,
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
    const url = await generatePresignedUrl(body.bucket, body.key, body.filename, 60);

    return response<unknown>({
      statusCode: 200,
      body: { url },
    });
  } catch (error) {
    return response(handleOpensearchError(error));
  }
};

async function getClient(bucket: string) {
  if (bucket.startsWith("uploads")) {
    const stsClient = new STSClient({ region: process.env.region });

    // Assume the role
    const assumedRoleResponse = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: process.env.legacyS3AccessRoleArn,
        RoleSessionName: "AssumedRoleSession",
      }),
    );

    // Extract the assumed role credentials
    const assumedCredentials = assumedRoleResponse.Credentials;

    if (!assumedCredentials) {
      throw new Error("No assumed credentials");
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
  expirationInSeconds: number,
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
