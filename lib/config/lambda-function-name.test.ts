import { describe, expect, it } from "vitest";

import {
  AWS_COGNITO_DOMAIN_PREFIX_MAX_LENGTH,
  AWS_LAMBDA_FUNCTION_NAME_MAX_LENGTH,
  AWS_S3_BUCKET_NAME_MAX_LENGTH,
  AWS_SES_CONFIGURATION_SET_NAME_MAX_LENGTH,
  awsCognitoDomainPrefix,
  awsCognitoDomainPrefixWithClientId,
  awsLambdaFunctionName,
  awsS3AccountBucketName,
  truncateAwsName,
} from "./lambda-function-name";

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

describe("awsS3AccountBucketName", () => {
  it("keeps short account-suffixed bucket names unchanged", () => {
    expect(awsS3AccountBucketName("mako-val-cloudfront-logs", "123456789012")).toBe(
      "mako-val-cloudfront-logs-123456789012",
    );
  });

  it("truncates long CloudFront log bucket prefixes to the S3 limit", () => {
    const name = awsS3AccountBucketName(
      "mako-oy2-40481-smart-outbound-events-cloudfront-logs",
      "635052997545",
    );

    expect(name.length).toBeLessThanOrEqual(AWS_S3_BUCKET_NAME_MAX_LENGTH);
    expect(name.endsWith("-635052997545")).toBe(true);
    expect(name).not.toBe("mako-oy2-40481-smart-outbound-events-cloudfront-logs-635052997545");
  });
});

describe("truncateAwsName", () => {
  it("truncates SES configuration set names to 64 characters", () => {
    const name = truncateAwsName(
      "mako-oy2-40481-smart-outbound-events-email-email-configuration-set",
      AWS_SES_CONFIGURATION_SET_NAME_MAX_LENGTH,
    );

    expect(name.length).toBe(AWS_SES_CONFIGURATION_SET_NAME_MAX_LENGTH);
  });
});

describe("awsCognitoDomainPrefixWithClientId", () => {
  it("keeps short hosted-UI prefixes unchanged for existing stages", () => {
    expect(awsCognitoDomainPrefixWithClientId("main-login", "abcdefghijklmnopqrstuvwxyz")).toBe(
      "main-login-abcdefghijklmnopqrstuvwxyz",
    );
  });

  it("truncates long stage prefixes so the resolved domain stays within 63 characters", () => {
    const name = awsCognitoDomainPrefixWithClientId(
      "oy2-40481-smart-outbound-events-login",
      "abcdefghijklmnopqrstuvwxyz",
    );

    expect(name.length).toBeLessThanOrEqual(AWS_COGNITO_DOMAIN_PREFIX_MAX_LENGTH);
    expect(name.endsWith("-abcdefghijklmnopqrstuvwxyz")).toBe(true);
    expect(name).not.toBe("oy2-40481-smart-outbound-events-login-abcdefghijklmnopqrstuvwxyz");
  });
});

describe("awsCognitoDomainPrefix", () => {
  it("keeps short search domain prefixes unchanged", () => {
    expect(awsCognitoDomainPrefix("mako-main-search")).toBe("mako-main-search");
  });
});
