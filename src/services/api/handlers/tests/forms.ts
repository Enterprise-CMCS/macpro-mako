import {
  //   afterEach,
  //   beforeAll,
  //   beforeEach,
  it,
  describe,
  expect,
  //   vi,
} from "vitest";
import { forms, getFilepathForIdAndVersion } from "./yourLambdaFile"; // Replace with the correct import path

// const handler = getAppianData as { handler: Function };
// const callback = vi.fn();

const event = {
  body: "{'fileId': 'testform'}",
  resource: "/{proxy+}",
  path: "/path/to/resource",
  httpMethod: "POST",
  isBase64Encoded: true,
  queryStringParameters: {
    foo: "bar",
  },
  multiValueQueryStringParameters: {
    foo: ["bar"],
  },
  pathParameters: {
    proxy: "/path/to/resource",
  },
  stageVariables: {
    baz: "qux",
  },
  headers: {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "en-US,en;q=0.8",
    "Cache-Control": "max-age=0",
    "CloudFront-Forwarded-Proto": "https",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-Mobile-Viewer": "false",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Tablet-Viewer": "false",
    "CloudFront-Viewer-Country": "US",
    Host: "1234567890.execute-api.us-east-1.amazonaws.com",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Custom User Agent String",
    Via: "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
    "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
    "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
    "X-Forwarded-Port": "443",
    "X-Forwarded-Proto": "https",
  },
  requestContext: {
    accountId: "123456789012",
    resourceId: "123456",
    stage: "prod",
    requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
    requestTime: "09/Apr/2015:12:34:56 +0000",
    requestTimeEpoch: 1428582896000,
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      accessKey: null,
      sourceIp: "127.0.0.1",
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: "Custom User Agent String",
      user: null,
    },
    path: "/prod/path/to/resource",
    resourcePath: "/{proxy+}",
    httpMethod: "POST",
    apiId: "1234567890",
    protocol: "HTTP/1.1",
  },
};

describe("Forms Lambda Tests", () => {
  it("should return 404 with error message if fileId is not provided", async () => {
    const event = {
      body: JSON.stringify({}),
    };
    const result = await forms(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      error: "File ID was not provided",
    });
  });

  it("should return 404 with error message if filePath is not found", async () => {
    const event = {
      body: JSON.stringify({ fileId: "test", formVersion: "1" }),
    };
    const result = await forms(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ error: "File Not Found" });
  });

  it("should return 500 with error message if an internal error occurs", async () => {
    const event = {
      body: JSON.stringify({ fileId: "error" }),
    };
    const result = await forms(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "Internal server error" });
  });

  it("should return 200 with JSON data if everything is valid", async () => {
    const event = {
      body: JSON.stringify({ fileId: "test", formVersion: "1" }),
    };
    const result = await forms(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("application/json");
    // Add more assertions for the expected JSON response
  });
});

describe("getFilepathForIdAndVersion Tests", () => {
  it("should return undefined if fileId and formVersion are not provided", () => {
    const result = getFilepathForIdAndVersion("", undefined);
    expect(result).toBeUndefined();
  });

  it("should return the correct file path if valid fileId and formVersion are provided", () => {
    const result = getFilepathForIdAndVersion("test", "1");
    expect(result).toBe("/opt/test/v1.json");
  });

  it("should handle invalid version numbers and return the correct path for the max version", () => {
    const result = getFilepathForIdAndVersion("test", undefined);
    expect(result).toBe("/opt/test/v2.json"); // Assuming v2 is the max version
  });

  // Add more test cases as needed
});
