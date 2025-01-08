import { describe, it, expect, vi, afterEach } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getAttachmentUrl";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  OPENSEARCH_DOMAIN,
  getRequestContext,
  NOT_FOUND_ITEM_ID,
  HI_TEST_ITEM_ID,
  TEST_ITEM_ID,
  WITHDRAWN_CHANGELOG_ITEM_ID,
  GET_ERROR_ITEM_ID,
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
} from "mocks";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("Lambda Handler", () => {
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

  it("should return 500 if osDomain is missing", async () => {
    delete process.env.osDomain;

    const event = {
      body: JSON.stringify({
        id: "test-id",
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "test-key",
        filename: "test-file",
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ message: "ERROR: process.env.osDomain must be defined" }),
    );

    process.env.osDomain = OPENSEARCH_DOMAIN;
  });

  it("should return 404 if no package is found", async () => {
    const event = {
      body: JSON.stringify({
        id: NOT_FOUND_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "test-key",
        filename: "test-file",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(JSON.stringify({ message: "No record found for the given id" }));
  });

  it("should return 404 if state access is not permitted", async () => {
    const event = {
      body: JSON.stringify({
        id: HI_TEST_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "test-key",
        filename: "test-file",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(
      JSON.stringify({ message: "state access not permitted for the given id" }),
    );
  });

  it("should return 500 if attachment details are not found", async () => {
    const event = {
      body: JSON.stringify({
        id: TEST_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "test-key",
        filename: "test-file",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Attachment details not found for given record id." }),
    );
  });

  it("should return 200 with the presigned URL if all checks pass", async () => {
    const mockUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/123e4567-e89b-12d3-a456-426614174000`;
    vi.mocked(getSignedUrl).mockResolvedValueOnce(mockUrl);

    const event = {
      body: JSON.stringify({
        id: WITHDRAWN_CHANGELOG_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "doc001",
        filename: "contract_amendment_2024.pdf",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: mockUrl }));
  });

  it("should handle errors during processing", async () => {
    const event = {
      body: JSON.stringify({
        id: GET_ERROR_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "test-key",
        filename: "test-file",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
