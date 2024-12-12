import { http, HttpResponse, PathParams } from "msw";
import type { SecretManagerRequestBody } from "..";
import secrets, { TEST_SECRET_ERROR_ID } from "../data/secrets";

const defaultSecretHandler = http.post<PathParams, SecretManagerRequestBody>(
  `https://secretsmanager.us-east-1.amazonaws.com`,
  async ({ request, params }) => {
    console.log("secret handler request called with: ", {
      method: request.method,
      url: request.url,
      params: JSON.stringify(params),
      headers: request.headers,
      body: request.body,
    });
    const { SecretId } = await request.json();
    console.log({ SecretId });
    if (!SecretId) {
      return HttpResponse.json({
        name: "InvalidParameterException",
        message: "Missing SecretId in request body",
        status: 400,
      });
    }

    if (SecretId == TEST_SECRET_ERROR_ID) {
      console.log("throw error");
      return HttpResponse.json({
        name: "InternalServiceError",
        message: "Internal service error",
        status: 500,
      });
    }

    const secret = secrets[SecretId];

    if (secret) {
      const target = request.headers.get("x-amz-target");
      if (target == "secretsmanager.DescribeSecret") {
        return HttpResponse.json({
          ...secret,
        });
      }
      if (target == "secretsmanager.GetSecretValue") {
        return HttpResponse.json(secret);
      }

      console.log(`target: ${target} not supported`);
      return HttpResponse.json({
        name: "ResourceNotFoundException",
        message: "Target not supported",
        status: 500,
      });
    }
    return HttpResponse.json({
      name: "ResourceNotFoundException",
      message: "No secret found for Id",
      status: 404,
    });
  },
);

export const defaultHandlers = [defaultSecretHandler];
