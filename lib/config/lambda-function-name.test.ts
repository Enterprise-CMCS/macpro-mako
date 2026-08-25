import { describe, expect, it } from "vitest";

import { AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH, awsLambdaFunctionName } from "./lambda-function-name";

describe("awsLambdaFunctionName", () => {
  it("keeps short names unchanged so existing stages stay stable", () => {
    expect(awsLambdaFunctionName("mako", "main", "api", "search")).toBe("mako-main-api-search");
    expect(awsLambdaFunctionName("mako", "production", "api", "externalAttachmentAuthorizer")).toBe(
      "mako-production-api-externalAttachmentAuthorizer",
    );
  });

  it("truncates long branch stages to the AWS Lambda name limit", () => {
    const name = awsLambdaFunctionName(
      "mako",
      "oy2-40481-smart-outbound-events",
      "api",
      "externalAttachmentAuthorizer",
    );

    expect(name.length).toBe(AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH);
    expect(name.startsWith("mako-oy2-40481-smart-outbound-events-api-")).toBe(true);
    expect(name).not.toBe("mako-oy2-40481-smart-outbound-events-api-externalAttachmentAuthorizer");
  });

  it("keeps truncated names unique when ids share a long prefix", () => {
    const left = awsLambdaFunctionName(
      "mako",
      "oy2-40481-smart-outbound-events",
      "api",
      "runAttachmentArchiveIntegrityCheck",
    );
    const right = awsLambdaFunctionName(
      "mako",
      "oy2-40481-smart-outbound-events",
      "api",
      "notifyAttachmentArchiveIntegrity",
    );

    expect(left).not.toBe(right);
    expect(left.length).toBeLessThanOrEqual(AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH);
    expect(right.length).toBeLessThanOrEqual(AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH);
  });
});
