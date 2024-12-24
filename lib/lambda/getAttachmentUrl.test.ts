import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getAttachmentUrl";
import { response } from "../libs/handler-lib";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStateFilter } from "../libs/api/auth/user";
import { getPackage, getPackageChangelog } from "../libs/api/package";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("@aws-sdk/client-sts", () => ({
  STSClient: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  AssumeRoleCommand: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  GetObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("../libs/api/auth/user", () => ({
  getStateFilter: vi.fn(),
}));

vi.mock("../libs/api/package", () => ({
  getPackage: vi.fn(),
  getPackageChangelog: vi.fn(),
}));

describe("Lambda Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain"; // Set the environment variable before each test
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 500 if osDomain is missing", async () => {
    delete process.env.osDomain;

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "ERROR:  osDomain env variable is required" },
    });
  });

  it("should return 404 if no package is found", async () => {
    (getPackage as Mock).mockResolvedValueOnce(null);

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 404,
      body: { message: "No record found for the given id" },
    });
  });

  it("should return 404 if state access is not permitted", async () => {
    (getPackage as Mock).mockResolvedValueOnce({
      _source: { state: "test-state" },
    });
    (getStateFilter as Mock).mockResolvedValueOnce({
      terms: { state: ["other-state"] },
    });

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 404,
      body: { message: "state access not permitted for the given id" },
    });
  });

  it("should return 500 if attachment details are not found", async () => {
    (getPackage as Mock).mockResolvedValueOnce({
      _source: { state: "test-state" },
    });
    (getStateFilter as Mock).mockResolvedValueOnce({
      terms: { state: ["test-state"] },
    });
    (getPackageChangelog as Mock).mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _source: {
              attachments: [{ bucket: "other-bucket", key: "other-key" }],
            },
          },
        ],
      },
    });

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Attachment details not found for given record id." },
    });
  });

  it("should return 200 with the presigned URL if all checks pass", async () => {
    (getPackage as Mock).mockResolvedValueOnce({
      _source: { state: "test-state" },
    });
    (getStateFilter as Mock).mockResolvedValueOnce({
      terms: { state: ["test-state"] },
    });
    (getPackageChangelog as Mock).mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _source: {
              attachments: [{ bucket: "test-bucket", key: "test-key" }],
            },
          },
        ],
      },
    });
    (getSignedUrl as Mock).mockResolvedValueOnce("test-presigned-url");

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: { url: "test-presigned-url" },
    });
  });

  it("should handle errors during processing", async () => {
    (getPackage as Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: "test-bucket",
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
