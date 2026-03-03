import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "libs/handler-lib";

import { TOKEN_EXPIRATION_SECONDS } from "./external-auth";
import { issueClientCredentialsAccessToken } from "./external-auth/service";

type TokenRequest = {
  grantType: string;
  clientId: string;
  clientSecret: string;
};

function errorResponse(
  statusCode: number,
  errorCode: "invalid_request" | "unsupported_grant_type" | "invalid_client" | "server_error",
  description: string,
) {
  return response({
    statusCode,
    body: {
      error: errorCode,
      error_description: description,
    },
  });
}

function parseBody(event: APIGatewayProxyEvent): TokenRequest | ReturnType<typeof errorResponse> {
  const contentType = event.headers["Content-Type"] || event.headers["content-type"] || "";
  if (!event.body) {
    return errorResponse(400, "invalid_request", "Request body is required.");
  }

  let body: Record<string, unknown>;
  if (contentType.includes("application/json")) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return errorResponse(400, "invalid_request", "Invalid JSON payload.");
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    body = Object.fromEntries(new URLSearchParams(event.body).entries());
  } else {
    return errorResponse(
      400,
      "invalid_request",
      "Content-Type must be application/json or application/x-www-form-urlencoded.",
    );
  }

  const grantType = body.grant_type ?? body.grantType;
  const clientId = body.client_id ?? body.clientId;
  const clientSecret = body.client_secret ?? body.clientSecret;

  if (typeof grantType !== "string" || grantType.trim() === "") {
    return errorResponse(400, "invalid_request", "grant_type is required.");
  }

  if (grantType !== "client_credentials") {
    return errorResponse(400, "unsupported_grant_type", "Only client_credentials is supported.");
  }

  if (typeof clientId !== "string" || clientId.trim() === "") {
    return errorResponse(400, "invalid_request", "client_id is required.");
  }

  if (typeof clientSecret !== "string" || clientSecret.trim() === "") {
    return errorResponse(400, "invalid_request", "client_secret is required.");
  }

  return {
    grantType,
    clientId: clientId.trim(),
    clientSecret,
  };
}

function isParsedBodyResponse(
  value: TokenRequest | ReturnType<typeof errorResponse>,
): value is ReturnType<typeof errorResponse> {
  return (value as ReturnType<typeof errorResponse>).statusCode !== undefined;
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const parsedBody = parseBody(event);
  if (isParsedBodyResponse(parsedBody)) {
    return parsedBody;
  }

  try {
    const tokenResult = await issueClientCredentialsAccessToken(
      parsedBody.clientId,
      parsedBody.clientSecret,
    );
    if (!tokenResult) {
      return errorResponse(401, "invalid_client", "Invalid client credentials.");
    }

    return response({
      statusCode: 200,
      body: {
        access_token: tokenResult.accessToken,
        token_type: "Bearer",
        expires_in: TOKEN_EXPIRATION_SECONDS,
      },
    });
  } catch {
    return errorResponse(500, "server_error", "Internal server error.");
  }
};
