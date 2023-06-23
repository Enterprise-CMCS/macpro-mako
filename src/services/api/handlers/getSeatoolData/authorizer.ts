import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const authorizationToken = event.authorizationToken;

  // Verify the authorization token
  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.region,
    });
    const params = {
      AccessToken: authorizationToken.split(" ")[1], // this has got to be the wrong token to use
    };
    const userAttributes = await cognitoClient.send(new GetUserCommand(params));

    // Process the user attributes as needed
    console.log("User attributes:", userAttributes);

    // Return a successful authorization response
    return generateAuthResponse("user", "Allow", event.methodArn);
  } catch (error) {
    // Return a failed authorization response
    console.error("Authorization error:", error);
    return generateAuthResponse("user", "Deny", event.methodArn);
  }
};

const generateAuthResponse = (
  principalId: string,
  effect: "Allow" | "Deny",
  methodArn: string
): APIGatewayAuthorizerResult => {
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: methodArn,
      },
    ],
  };

  return {
    principalId,
    policyDocument,
  };
};
