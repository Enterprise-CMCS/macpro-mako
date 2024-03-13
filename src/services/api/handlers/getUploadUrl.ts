import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import * as path from "node:path";

checkEnvVariables(["attachmentsBucketName", "attachmentsBucketRegion"]);

const s3 = new S3Client({
  region: process.env.attachmentsBucketRegion,
});

export const handler = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: { message: "Event body required" },
      });
    }
    const body = JSON.parse(event.body);
    const bucket = process.env.attachmentsBucketName;
    const fileName = body.fileName;
    const extension = path.extname(fileName);
    const key = `${uuidv4()}${extension}`; // ex:  123e4567-e89b-12d3-a456-426614174000.pdf
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn: 60,
      }
    );

    return response<unknown>({
      statusCode: 200,
      body: { url, bucket, key },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

function checkEnvVariables(requiredEnvVariables: string[]) {
  const missingVariables = requiredEnvVariables.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }
}
