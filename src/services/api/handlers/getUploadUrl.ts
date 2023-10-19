import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

checkEnvVariables(["attchmentsBucketName", "attchmentsBucketRegion"]);

const s3 = new S3Client({
  region: process.env.attachmentsBucketRegion,
});

export const handler = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.attchmentsBucketName,
        Key: uuidv4(),
      }),
      {
        expiresIn: 60,
      }
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

function checkEnvVariables(requiredEnvVariables) {
  const missingVariables = requiredEnvVariables.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }
}
