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
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      let resp = await s3.send(new PutBucketPolicyCommand({ Bucket, Policy }));
      console.log(resp)
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};
