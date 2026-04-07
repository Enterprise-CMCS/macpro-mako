import { APIGatewayProxyEvent } from "aws-lambda";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getActiveClient,
  getExternalApiAuthConfig,
  isClientAllowedForObject,
} from "./external-auth";
import { handler } from "./getExternalAttachmentUrl";
import { generatePresignedDownloadUrl } from "./presignedAttachmentUrl";

const { getRequestedAttachmentArchiveDownload, sendAttachmentArchiveRebuildRequest } = vi.hoisted(
  () => ({
    getRequestedAttachmentArchiveDownload: vi.fn(),
    sendAttachmentArchiveRebuildRequest: vi.fn(),
  }),
);

const { getPackage, getPackageChangelog } = vi.hoisted(() => ({
  getPackage: vi.fn(),
  getPackageChangelog: vi.fn(),
}));

vi.mock("./external-auth", () => ({
  getExternalApiAuthConfig: vi.fn(),
  getActiveClient: vi.fn(),
  isClientAllowedForObject: vi.fn(),
}));

vi.mock("./attachmentArchive-lib", () => ({
  getRequestedAttachmentArchiveDownload,
}));

vi.mock("../attachment-archive/rebuild-queue", () => ({
  sendAttachmentArchiveRebuildRequest,
}));

vi.mock("../libs/api/package", () => ({
  getPackage,
  getPackageChangelog,
}));

vi.mock("./presignedAttachmentUrl", () => ({
  generatePresignedDownloadUrl: vi.fn(),
  isS3ObjectAccessError: vi.fn((error: unknown) => {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const candidate = error as { kind?: string; s3Status?: number };
    return candidate.kind === "S3_OBJECT_ACCESS" && [403, 404].includes(candidate.s3Status || 0);
  }),
}));

function createEvent(body: unknown, clientId: string | null = "partner-app"): APIGatewayProxyEvent {
  return {
    body: typeof body === "string" ? body : JSON.stringify(body),
    requestContext: {
      authorizer: clientId ? { clientId } : {},
    },
  } as APIGatewayProxyEvent;
}

const mockClient = {
  clientId: "partner-app",
  status: "ACTIVE" as const,
  grants: ["client_credentials"],
  secretSalt: Buffer.from("salt"),
  secretHash: Buffer.from("hash"),
  allowedLocations: [],
};

describe("getExternalAttachmentUrl handler", () => {
  beforeEach(() => {
    vi.mocked(getExternalApiAuthConfig).mockResolvedValue({
      issuer: "mako-external-oauth",
      jwtSigningKey: Buffer.alloc(32, 1),
      clients: [mockClient],
    });
    vi.mocked(getActiveClient).mockReturnValue(mockClient);
    vi.mocked(isClientAllowedForObject).mockReturnValue(true);
    vi.mocked(generatePresignedDownloadUrl).mockResolvedValue("https://signed.example.com/doc.pdf");
    vi.mocked(getPackage).mockResolvedValue({ found: true } as any);
    vi.mocked(getPackageChangelog).mockResolvedValue({
      hits: {
        hits: [{ _source: { timestamp: 10 } }, { _source: { timestamp: 25 } }],
      },
    } as any);
    getRequestedAttachmentArchiveDownload.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "READY",
        bucketName: "mako-main-attachment-archives-635052997545",
        artifactKey: "package/MD-10-6772/all/hash.zip",
        filename: "MD-10-6772.zip",
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns READY object responses for valid bucket and key payloads", async () => {
    const event = createEvent({
      bucket: "mako-main-attachments-635052997545",
      key: "folder/doc.pdf",
      expiresIn: 120,
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        status: "READY",
        target: "object",
        filename: "doc.pdf",
        url: "https://signed.example.com/doc.pdf",
        expiresIn: 120,
      }),
    );
    expect(generatePresignedDownloadUrl).toHaveBeenCalledWith(
      "mako-main-attachments-635052997545",
      "folder/doc.pdf",
      "doc.pdf",
      120,
      {
        validateObjectAccess: true,
      },
    );
  });

  it("uses key as filename when key has no prefix and filename is omitted", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "plain-name.pdf",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(generatePresignedDownloadUrl).toHaveBeenCalledWith(
      "mako-main-attachments-635052997545",
      "plain-name.pdf",
      "plain-name.pdf",
      60,
      {
        validateObjectAccess: true,
      },
    );
  });

  it("accepts objectName as a key alias", async () => {
    const result = await handler(
      createEvent({
        bucket: "uploads-develop-attachments-116229642442",
        objectName: "protected/path/legacy.csv",
        filename: "legacy.csv",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(generatePresignedDownloadUrl).toHaveBeenCalledWith(
      "uploads-develop-attachments-116229642442",
      "protected/path/legacy.csv",
      "legacy.csv",
      60,
      {
        validateObjectAccess: true,
      },
    );
  });

  it("ignores packageId for object downloads when bucket and key are provided", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "folder/doc.pdf",
        packageId: "MD-10-6772",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        status: "READY",
        target: "object",
        filename: "doc.pdf",
        url: "https://signed.example.com/doc.pdf",
        expiresIn: 60,
      }),
    );
    expect(getRequestedAttachmentArchiveDownload).not.toHaveBeenCalled();
  });

  it("falls back to filename as key when key is omitted", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        filename: "same-as-key.png",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(generatePresignedDownloadUrl).toHaveBeenCalledWith(
      "mako-main-attachments-635052997545",
      "same-as-key.png",
      "same-as-key.png",
      60,
      {
        validateObjectAccess: true,
      },
    );
  });

  it("returns READY package archive responses", async () => {
    vi.mocked(generatePresignedDownloadUrl).mockResolvedValueOnce(
      "https://signed.example.com/package.zip",
    );

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        status: "READY",
        target: "packageArchive",
        filename: "MD-10-6772.zip",
        url: "https://signed.example.com/package.zip",
        expiresIn: 60,
      }),
    );
    expect(getRequestedAttachmentArchiveDownload).toHaveBeenCalledWith({
      packageId: "MD-10-6772",
      scope: "all",
      sectionId: undefined,
      changelog: [{ _source: { timestamp: 10 } }, { _source: { timestamp: 25 } }],
    });
    expect(isClientAllowedForObject).toHaveBeenCalledWith(
      mockClient,
      "mako-main-attachment-archives-635052997545",
      "package/MD-10-6772/all/hash.zip",
    );
  });

  it("accepts section as an archive alias and returns READY section archive responses", async () => {
    getRequestedAttachmentArchiveDownload.mockResolvedValueOnce({
      needsRebuild: false,
      response: {
        status: "READY",
        bucketName: "mako-ephemeral-attachment-archives-635052997545",
        artifactKey: "stage/datasink/package/MD-10-6772/section/section-a/hash.zip",
        filename: "MD-10-6772-section-a.zip",
      },
    });
    vi.mocked(generatePresignedDownloadUrl).mockResolvedValueOnce(
      "https://signed.example.com/section.zip",
    );

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
        section: "section-a",
        expiresIn: 300,
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        status: "READY",
        target: "sectionArchive",
        filename: "MD-10-6772-section-a.zip",
        url: "https://signed.example.com/section.zip",
        expiresIn: 300,
      }),
    );
    expect(getRequestedAttachmentArchiveDownload).toHaveBeenCalledWith({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: "section-a",
      changelog: [{ _source: { timestamp: 10 } }, { _source: { timestamp: 25 } }],
    });
  });

  it("returns PENDING archive responses and queues a rebuild when needed", async () => {
    getRequestedAttachmentArchiveDownload.mockResolvedValueOnce({
      needsRebuild: true,
      response: {
        status: "PENDING",
        pollAfterSeconds: 3,
      },
    });

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
        sectionId: "section-a",
      }),
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
        status: "PENDING",
        pollAfterSeconds: 3,
        packageId: "MD-10-6772",
        sectionId: "section-a",
      }),
    );
    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenCalledWith({
      packageId: "MD-10-6772",
      latestTimestamp: 25,
      source: "request",
    });
    expect(generatePresignedDownloadUrl).not.toHaveBeenCalled();
  });

  it("returns 403 when ACL does not allow the resolved archive artifact", async () => {
    vi.mocked(isClientAllowedForObject).mockReturnValueOnce(false);

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Client is not allowed to access the requested object." }),
    );
  });

  it("returns 404 when the requested archive package does not exist", async () => {
    vi.mocked(getPackage).mockResolvedValueOnce(undefined);

    const result = await handler(
      createEvent({
        packageId: "MD-99-0000",
      }),
    );

    expect(result.statusCode).toBe(404);
    expect(result.body).toEqual(
      JSON.stringify({ message: "No record found for the given packageId" }),
    );
  });

  it("returns 404 when the archive resolver throws a known not-found error", async () => {
    getRequestedAttachmentArchiveDownload.mockRejectedValueOnce({
      statusCode: 404,
      message: JSON.stringify({ message: "No package activity found for section section-a" }),
    });

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
        sectionId: "section-a",
      }),
    );

    expect(result.statusCode).toBe(404);
    expect(result.body).toEqual(
      JSON.stringify({ message: "No package activity found for section section-a" }),
    );
  });

  it("returns 409 for terminal archive failures", async () => {
    getRequestedAttachmentArchiveDownload.mockResolvedValueOnce({
      needsRebuild: false,
      response: {
        status: "FAILED",
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download.",
      },
    });

    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
      }),
    );

    expect(result.statusCode).toBe(409);
    expect(result.body).toEqual(
      JSON.stringify({
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download.",
      }),
    );
  });

  it("returns 400 when bucket/key requests are mixed with sectionId", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
        sectionId: "section-a",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({
        message: "sectionId cannot be combined with bucket/key attachment requests.",
      }),
    );
  });

  it("returns 400 when section and sectionId do not match", async () => {
    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
        sectionId: "section-a",
        section: "section-b",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({
        message: "section and sectionId must match when both are provided.",
      }),
    );
  });

  it("returns 400 when body is missing", async () => {
    const event = { ...createEvent({}), body: null } as unknown as APIGatewayProxyEvent;
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "Request body is required." }));
  });

  it("returns 400 for malformed JSON", async () => {
    const result = await handler(createEvent("{not-json"));

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "Invalid JSON payload." }));
  });

  it("returns 400 when bucket is missing from object requests", async () => {
    const result = await handler(
      createEvent({
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "bucket is required." }));
  });

  it("returns 400 when key and filename are missing from object requests", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "key is required." }));
  });

  it("returns 400 when packageId is missing from archive requests", async () => {
    const result = await handler(
      createEvent({
        expiresIn: 120,
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({ message: "packageId is required when requesting an archive." }),
    );
  });

  it("returns 400 for invalid expiresIn", async () => {
    const result = await handler(
      createEvent({
        packageId: "MD-10-6772",
        expiresIn: 0,
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(
      JSON.stringify({ message: "expiresIn must be an integer between 1 and 604800." }),
    );
  });

  it("returns 401 when clientId is missing from authorizer context", async () => {
    const result = await handler(
      createEvent(
        {
          bucket: "mako-main-attachments-635052997545",
          key: "doc.pdf",
        },
        null,
      ),
    );

    expect(result.statusCode).toBe(401);
    expect(result.body).toEqual(JSON.stringify({ message: "Unauthorized" }));
  });

  it("returns 403 when client does not have the client_credentials grant", async () => {
    vi.mocked(getActiveClient).mockReturnValueOnce({
      ...mockClient,
      grants: [],
    });

    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Client is not authorized for this endpoint." }),
    );
  });

  it("returns 403 when ACL does not allow requested objects", async () => {
    vi.mocked(isClientAllowedForObject).mockReturnValueOnce(false);

    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Client is not allowed to access the requested object." }),
    );
  });

  it("returns 403 when presign helper reports access denied for S3 objects", async () => {
    vi.mocked(generatePresignedDownloadUrl).mockRejectedValueOnce({
      kind: "S3_OBJECT_ACCESS",
      s3Status: 403,
    });

    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(403);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Access to the requested S3 object is denied." }),
    );
  });

  it("returns 404 when presign helper reports missing S3 objects", async () => {
    vi.mocked(generatePresignedDownloadUrl).mockRejectedValueOnce({
      kind: "S3_OBJECT_ACCESS",
      s3Status: 404,
    });

    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(404);
    expect(result.body).toEqual(JSON.stringify({ message: "Requested S3 object was not found." }));
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(generatePresignedDownloadUrl).mockRejectedValueOnce(new Error("boom"));

    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(500);
    expect(result.body).toEqual(JSON.stringify({ message: "Internal server error." }));
  });
});
