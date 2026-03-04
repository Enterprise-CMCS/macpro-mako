import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent } from "aws-lambda";
import {
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
  GET_ERROR_ITEM_ID,
  getRequestContext,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  OPENSEARCH_DOMAIN,
  TEST_ITEM_ID,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./getAttachmentUrl";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

(globalThis as any).logger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe("Lambda Handler", () => {
  afterEach(() => {
    delete process.env.LEGACY_ATTACHMENT_BUCKET_MAP;
    vi.clearAllMocks();
    vi.restoreAllMocks();
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

  it("should remap legacy bucket requests and log when remapping is applied", async () => {
    const mappedBucket = "mako-main-legacy-attachments-635052997545";
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = JSON.stringify({
      [ATTACHMENT_BUCKET_NAME]: mappedBucket,
    });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const mockUrl = `https://${mappedBucket}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/123e4567-e89b-12d3-a456-426614174000`;
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

    const firstSignedUrlCommand = vi.mocked(getSignedUrl).mock.calls[0]?.[1] as any;
    expect(firstSignedUrlCommand?.input?.Bucket).toBe(mappedBucket);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_applied"),
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: mockUrl }));
    infoSpy.mockRestore();
  });

  it("should fallback to legacy bucket and log warning if remapped bucket fails", async () => {
    const mappedBucket = "mako-main-legacy-attachments-635052997545";
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = JSON.stringify({
      [ATTACHMENT_BUCKET_NAME]: mappedBucket,
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fallbackUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/fallback`;
    vi.mocked(getSignedUrl)
      .mockRejectedValueOnce(new Error("AccessDenied"))
      .mockResolvedValueOnce(fallbackUrl);

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

    const secondSignedUrlCommand = vi.mocked(getSignedUrl).mock.calls[1]?.[1] as any;
    expect(secondSignedUrlCommand?.input?.Bucket).toBe(ATTACHMENT_BUCKET_NAME);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_fallback"),
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: fallbackUrl }));
    warnSpy.mockRestore();
  });

  it("should log warning when a legacy bucket request has no mapping", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
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

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_missing_mapping"),
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: mockUrl }));
    warnSpy.mockRestore();
  });

  it("should return 500 because response is missing credentials", async () => {
    const mockUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/123e4567-e89b-12d3-a456-426614174000`;
    vi.mocked(getSignedUrl).mockResolvedValueOnce(mockUrl);
    process.env.region = "us-fail-1";
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
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
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
