import { response } from "../libs/handler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

checkEnvVariables(["attachmentsBucketName", "attachmentsBucketRegion"]);

const s3 = new S3Client({
  region: process.env.attachmentsBucketRegion,
});

export const handler = async () => {
  try {
    const bucket = process.env.attachmentsBucketName;
    const key = uuidv4();
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
