import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayTokenAuthorizerHandler,
  PolicyDocument,
} from "aws-lambda";

import { authorizeExternalAccessToken } from "./external-auth";

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }
  return match[1].trim();
}

function generatePolicy(
  effect: "Allow" | "Deny",
  event: APIGatewayTokenAuthorizerEvent,
  principalId: string,
  context?: Record<string, string>,
): APIGatewayAuthorizerResult {
  const policyDocument: PolicyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: event.methodArn,
      },
    ],
  };

  return {
    principalId,
    policyDocument,
    ...(context && { context }),
  };
}

export const handler: APIGatewayTokenAuthorizerHandler = async (
  event,
): Promise<APIGatewayAuthorizerResult> => {
  const token = extractBearerToken(event.authorizationToken);
  if (!token) {
    return generatePolicy("Deny", event, "");
  }

  try {
    const authorizationResult = await authorizeExternalAccessToken(token);
    if (!authorizationResult) {
      return generatePolicy("Deny", event, "");
    }

    return generatePolicy("Allow", event, authorizationResult.client.clientId, {
      clientId: authorizationResult.client.clientId,
      grants: authorizationResult.client.grants.join(","),
      isOAuthClient: "true",
    });
  } catch {
    return generatePolicy("Deny", event, "");
  }
};
