import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
  Context,
} from "aws-lambda";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<CloudFormationCustomResourceResponse> => {
  const secretName = event.ResourceProperties.SecretName;

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    const value = response.SecretString || "";
    console.log("heyo");
    console.log("value");
    console.log(value);
    console.log("ret");
    console.log({
      Status: "SUCCESS",
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: {
        Value: value,
      },
    });

    return {
      Status: "SUCCESS",
      PhysicalResourceId: "static",
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: {
        Value: value,
      },
    };
  } catch (error) {
    console.error("An error has occured");
    console.log(error);
    return {
      Status: "FAILED",
      PhysicalResourceId: "static",
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Reason: error.message,
    };
  }
};
