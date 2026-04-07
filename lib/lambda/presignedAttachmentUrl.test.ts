import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockS3Send, mockStsSend, s3ClientConfigs } = vi.hoisted(() => ({
  mockS3Send: vi.fn(),
  mockStsSend: vi.fn(),
  s3ClientConfigs: [] as unknown[],
}));

vi.mock("@aws-sdk/client-s3", () => {
  class MockS3Client {
    constructor(config?: unknown) {
      s3ClientConfigs.push(config);
    }

    send = mockS3Send;
  }

  class MockGetObjectCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  class MockHeadObjectCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  return {
    S3Client: MockS3Client,
    GetObjectCommand: MockGetObjectCommand,
    HeadObjectCommand: MockHeadObjectCommand,
  };
});

vi.mock("@aws-sdk/client-sts", () => {
  class MockSTSClient {
    send = mockStsSend;
  }

  class MockAssumeRoleCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  return {
    STSClient: MockSTSClient,
    AssumeRoleCommand: MockAssumeRoleCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

import { generatePresignedDownloadUrl } from "./presignedAttachmentUrl";

describe("generatePresignedDownloadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    s3ClientConfigs.length = 0;
    process.env.region = "us-east-1";
    process.env.legacyS3AccessRoleArn =
      "arn:aws:iam::980018549706:role/delegatedadmin/developer/cross-acct-production-CrossAccountS3-1IENIT801WFC0";
  });

  it("runs HeadObject preflight when validateObjectAccess is true", async () => {
    mockS3Send.mockResolvedValueOnce({});
    vi.mocked(getSignedUrl).mockResolvedValueOnce("https://signed.example.com/doc.pdf");

    const url = await generatePresignedDownloadUrl(
      "mako-main-attachments-635052997545",
      "c021cc44-b244-48d4-8135-a97a17333e70.png",
      "doc.pdf",
      120,
      { validateObjectAccess: true },
    );

    expect(url).toEqual("https://signed.example.com/doc.pdf");
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(mockS3Send).toHaveBeenCalledWith(expect.any(HeadObjectCommand));

    const headObjectCall = mockS3Send.mock.calls[0]?.[0] as HeadObjectCommand & {
      input?: { Bucket?: string; Key?: string };
    };
    expect(headObjectCall.input).toEqual({
      Bucket: "mako-main-attachments-635052997545",
      Key: "c021cc44-b244-48d4-8135-a97a17333e70.png",
    });

    expect(getSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), {
      expiresIn: 120,
    });
  });

  it("does not call HeadObject when validateObjectAccess is false", async () => {
    vi.mocked(getSignedUrl).mockResolvedValueOnce("https://signed.example.com/doc.pdf");

    const url = await generatePresignedDownloadUrl(
      "mako-main-attachments-635052997545",
      "c021cc44-b244-48d4-8135-a97a17333e70.png",
      "doc.pdf",
      120,
      { validateObjectAccess: false },
    );

    expect(url).toEqual("https://signed.example.com/doc.pdf");
    expect(mockS3Send).not.toHaveBeenCalled();
    expect(getSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), {
      expiresIn: 120,
    });
  });

  it("builds a safe content-disposition header for unicode filenames", async () => {
    vi.mocked(getSignedUrl).mockResolvedValueOnce("https://signed.example.com/doc.pdf");

    await generatePresignedDownloadUrl(
      "mako-main-attachments-635052997545",
      "c021cc44-b244-48d4-8135-a97a17333e70.png",
      "Screenshot 2026-02-19 at 1.13.37\u202fPM.png",
      120,
    );

    const getObjectCall = vi.mocked(getSignedUrl).mock.calls[0]?.[1] as GetObjectCommand & {
      input?: { ResponseContentDisposition?: string };
    };

    expect(getObjectCall.input?.ResponseContentDisposition).toBe(
      `attachment; filename="Screenshot 2026-02-19 at 1.13.37 PM.png"; filename*=UTF-8''Screenshot%202026-02-19%20at%201.13.37%E2%80%AFPM.png`,
    );
  });

  it("maps HeadObject access denied errors to typed S3 access errors", async () => {
    mockS3Send.mockRejectedValueOnce({
      name: "AccessDenied",
      $metadata: {
        httpStatusCode: 403,
      },
    });

    await expect(
      generatePresignedDownloadUrl(
        "mako-main-attachments-635052997545",
        "c021cc44-b244-48d4-8135-a97a17333e70.png",
        "doc.pdf",
        120,
        { validateObjectAccess: true },
      ),
    ).rejects.toMatchObject({
      kind: "S3_OBJECT_ACCESS",
      s3Status: 403,
    });

    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it("uses assumed-role credentials for uploads buckets", async () => {
    mockStsSend.mockResolvedValueOnce({
      Credentials: {
        AccessKeyId: "AKIA_TEST",
        SecretAccessKey: "SECRET_TEST",
        SessionToken: "SESSION_TEST",
      },
    });
    vi.mocked(getSignedUrl).mockResolvedValueOnce("https://signed.example.com/legacy.pdf");

    const url = await generatePresignedDownloadUrl(
      "uploads-production-attachments-980018549706",
      "protected/legacy-doc.pdf",
      "legacy-doc.pdf",
      60,
    );

    expect(url).toEqual("https://signed.example.com/legacy.pdf");
    expect(mockStsSend).toHaveBeenCalledTimes(1);
    expect(mockStsSend).toHaveBeenCalledWith(expect.any(AssumeRoleCommand));

    const assumeRoleCommand = mockStsSend.mock.calls[0]?.[0] as AssumeRoleCommand & {
      input?: { RoleArn?: string; RoleSessionName?: string };
    };

    expect(assumeRoleCommand.input).toEqual({
      RoleArn:
        "arn:aws:iam::980018549706:role/delegatedadmin/developer/cross-acct-production-CrossAccountS3-1IENIT801WFC0",
      RoleSessionName: "AssumedRoleSession",
    });

    const legacyClientConfig = s3ClientConfigs.at(-1) as {
      credentials?: {
        accessKeyId?: string;
        secretAccessKey?: string;
        sessionToken?: string;
      };
    };

    expect(legacyClientConfig.credentials).toEqual({
      accessKeyId: "AKIA_TEST",
      secretAccessKey: "SECRET_TEST",
      sessionToken: "SESSION_TEST",
    });
  });
});
