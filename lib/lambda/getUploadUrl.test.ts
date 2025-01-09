import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getUploadUrl";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { ATTACHMENT_BUCKET_NAME, ATTACHMENT_BUCKET_REGION } from "mocks";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

describe("Handler for generating signed URL", () => {
  const TEST_UUID = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    (uuidv4 as Mock).mockReturnValue(TEST_UUID);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 200 with signed URL, bucket, and key", async () => {
    const mockUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/${TEST_UUID}`;
    (getSignedUrl as Mock).mockResolvedValueOnce(mockUrl);

    const event = {
      body: JSON.stringify({ fileName: "test-file.pdf" }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ url: mockUrl, bucket: ATTACHMENT_BUCKET_NAME, key: `${TEST_UUID}.pdf` }),
    );
  });

  it("should return 500 if an error occurs during processing", async () => {
    (getSignedUrl as Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      body: JSON.stringify({ fileName: "test-file.pdf" }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should throw an error if required environment variables are missing", async () => {
    delete process.env.attachmentsBucketName;

    const res = await handler({} as APIGatewayEvent);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));

    process.env.attachmentsBucketName = ATTACHMENT_BUCKET_NAME;
  });
});
