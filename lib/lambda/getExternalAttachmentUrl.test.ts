import { APIGatewayProxyEvent } from "aws-lambda";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getActiveClient,
  getExternalApiAuthConfig,
  isClientAllowedForObject,
} from "./external-auth";
import { handler } from "./getExternalAttachmentUrl";
import { generatePresignedDownloadUrl } from "./presignedAttachmentUrl";

vi.mock("./external-auth", () => ({
  getExternalApiAuthConfig: vi.fn(),
  getActiveClient: vi.fn(),
  isClientAllowedForObject: vi.fn(),
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 for valid bucket and key payload", async () => {
    const event = createEvent({
      bucket: "mako-main-attachments-635052997545",
      key: "folder/doc.pdf",
      expiresIn: 120,
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(
      JSON.stringify({
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

  it("accepts objectName as key alias", async () => {
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

  it("returns 400 when bucket is missing", async () => {
    const result = await handler(
      createEvent({
        key: "doc.pdf",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "bucket is required." }));
  });

  it("returns 400 when key and filename are missing", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify({ message: "key is required." }));
  });

  it("returns 400 for invalid expiresIn", async () => {
    const result = await handler(
      createEvent({
        bucket: "mako-main-attachments-635052997545",
        key: "doc.pdf",
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

  it("returns 403 when client does not have client_credentials grant", async () => {
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

  it("returns 403 when ACL does not allow requested object", async () => {
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

  it("returns 403 when presign helper reports access denied for S3 object", async () => {
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

  it("returns 404 when presign helper reports missing S3 object", async () => {
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
