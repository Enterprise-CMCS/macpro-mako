import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client();

export const handler: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  let Bucket = event.ResourceProperties.Bucket;
  let Policy = JSON.stringify(event.ResourceProperties.Policy);
  const maxRetries = 5;
  const retryDelay = 5000;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      let retries = 0;
      let success = false;
      while (!success && retries < maxRetries) {
        try {
          let resp = await s3.send(new PutBucketPolicyCommand({ Bucket, Policy }));
          console.log(resp);
          success = true;
        } catch (error) {
          console.error(`Error in S3 PutBucketPolicyCommand: ${error}`);
          retries++;
          console.log(`Retrying in ${retryDelay / 1000} seconds (Retry ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      if (!success) {
        console.error(`Failed to execute S3 PutBucketPolicyCommand after ${maxRetries} retries.`);
        responseStatus = FAILED;
      }
    }
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};
