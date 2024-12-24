import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getUploadUrl";
import { response } from "../libs/handler-lib";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  PutObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

describe("Handler for generating signed URL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.attachmentsBucketName = "test-bucket";
    process.env.attachmentsBucketRegion = "test-region";
    (uuidv4 as Mock).mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 200 with signed URL, bucket, and key", async () => {
    const mockUrl = "https://example.com/signed-url";
    (getSignedUrl as Mock).mockResolvedValueOnce(mockUrl);

    const event = {
      body: JSON.stringify({ fileName: "test-file.pdf" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: {
        url: mockUrl,
        bucket: "test-bucket",
        key: "123e4567-e89b-12d3-a456-426614174000.pdf",
      },
    });
    expect(getSignedUrl).toHaveBeenCalled();
  });

  it("should return 500 if an error occurs during processing", async () => {
    (getSignedUrl as Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      body: JSON.stringify({ fileName: "test-file.pdf" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });

  it("should throw an error if required environment variables are missing", async () => {
    delete process.env.attachmentsBucketName;

    await handler({} as APIGatewayEvent);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
