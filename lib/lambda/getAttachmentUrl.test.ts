import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent } from "aws-lambda";
import {
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
  getRequestContext,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  OPENSEARCH_DOMAIN,
  TEST_ITEM_ID,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createAttachmentBucketClientFactory, mockSend } = vi.hoisted(() => ({
  createAttachmentBucketClientFactory: vi.fn(),
  mockSend: vi.fn(),
}));

vi.mock("../attachment-archive/bucket-routing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../attachment-archive/bucket-routing")>()),
  createAttachmentBucketClientFactory,
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

import { handler } from "./getAttachmentUrl";

(globalThis as any).logger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe("Lambda Handler", () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({});
    createAttachmentBucketClientFactory.mockImplementation(
      () => async () =>
        ({
          send: mockSend,
        }) as any,
    );
  });

  afterEach(() => {
    delete process.env.LEGACY_ATTACHMENT_BUCKET_MAP;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mockSend.mockReset();
    createAttachmentBucketClientFactory.mockReset();
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
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("builds a safe content-disposition header for unicode filenames", async () => {
    const mockUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/123e4567-e89b-12d3-a456-426614174000`;
    vi.mocked(getSignedUrl).mockResolvedValueOnce(mockUrl);

    const event = {
      body: JSON.stringify({
        id: WITHDRAWN_CHANGELOG_ITEM_ID,
        bucket: ATTACHMENT_BUCKET_NAME,
        key: "doc001",
        filename: "Screenshot 2026-02-19 at 1.13.37\u202fPM.png",
      }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    await handler(event);

    const signedUrlCommand = vi.mocked(getSignedUrl).mock.calls[0]?.[1] as any;
    expect(signedUrlCommand?.input?.ResponseContentDisposition).toBe(
      `attachment; filename="Screenshot 2026-02-19 at 1.13.37 PM.png"; filename*=UTF-8''Screenshot%202026-02-19%20at%201.13.37%E2%80%AFPM.png`,
    );
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

    const accessCheckCommand = mockSend.mock.calls[0]?.[0] as any;
    const firstSignedUrlCommand = vi.mocked(getSignedUrl).mock.calls[0]?.[1] as any;
    expect(accessCheckCommand?.input?.Bucket).toBe(mappedBucket);
    expect(accessCheckCommand?.input?.Key).toBe("doc001");
    expect(firstSignedUrlCommand?.input?.Bucket).toBe(mappedBucket);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_applied"),
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: mockUrl }));
    infoSpy.mockRestore();
  });

  it("should fallback to legacy bucket and log warning if remapped bucket object is missing", async () => {
    const mappedBucket = "mako-main-legacy-attachments-635052997545";
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = JSON.stringify({
      [ATTACHMENT_BUCKET_NAME]: mappedBucket,
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fallbackUrl = `https://${ATTACHMENT_BUCKET_NAME}.s3.${ATTACHMENT_BUCKET_REGION}.amazonaws.com/fallback`;
    mockSend.mockRejectedValueOnce({
      name: "NoSuchKey",
      message: "The specified key does not exist",
    });
    vi.mocked(getSignedUrl).mockResolvedValueOnce(fallbackUrl);

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

    const accessCheckCommand = mockSend.mock.calls[0]?.[0] as any;
    const signedUrlCommand = vi.mocked(getSignedUrl).mock.calls[0]?.[1] as any;
    expect(accessCheckCommand?.input?.Bucket).toBe(mappedBucket);
    expect(signedUrlCommand?.input?.Bucket).toBe(ATTACHMENT_BUCKET_NAME);
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

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_missing_mapping"),
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ url: mockUrl }));
    warnSpy.mockRestore();
  });

  it("should return 410 when an unmapped attachment bucket no longer exists", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSend.mockRejectedValueOnce({
      name: "NoSuchBucket",
      message: "The specified bucket does not exist",
    });

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

    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(410);
    expect(res.body).toEqual(
      JSON.stringify({ message: "This attachment is no longer available." }),
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("legacy_attachment_unavailable"));
    warnSpy.mockRestore();
  });

  it("should return 410 when the resolved attachment object is missing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSend.mockRejectedValueOnce({
      name: "NoSuchKey",
      message: "The specified key does not exist",
    });

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

    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(410);
    expect(res.body).toEqual(
      JSON.stringify({ message: "This attachment is no longer available." }),
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("legacy_attachment_unavailable"));
    warnSpy.mockRestore();
  });

  it("should return 409 when the resolved attachment is blocked by file scanning", async () => {
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = JSON.stringify({
      [ATTACHMENT_BUCKET_NAME]: "mako-main-attachments-test",
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockSend
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      })
      .mockResolvedValueOnce({
        TagSet: [{ Key: "virusScanStatus", Value: "INFECTED" }],
      });

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

    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toEqual(409);
    expect(res.body).toEqual(
      JSON.stringify({
        message:
          "Unable to download this attachment because file scanning did not complete successfully.",
      }),
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("attachment_blocked_by_scan"));
    warnSpy.mockRestore();
  });

  it("should return 500 when the canonical remapped bucket returns access denied", async () => {
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = JSON.stringify({
      [ATTACHMENT_BUCKET_NAME]: "mako-main-attachments-test",
    });
    mockSend
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      })
      .mockResolvedValueOnce({
        TagSet: [{ Key: "virusScanStatus", Value: "CLEAN" }],
      });

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

    expect(vi.mocked(getSignedUrl)).not.toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 500 because response is missing credentials", async () => {
    vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error("No assumed credentials"));
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
    mockSend.mockRejectedValueOnce(new Error("boom"));

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
});
