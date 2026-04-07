import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { getSecret } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./notifyAttachmentArchiveIntegrity";

vi.mock("shared-utils", () => ({
  getSecret: vi.fn(),
}));

type S3ObjectStore = Map<string, string>;

function toStoreKey(bucket: string, key: string) {
  return `${bucket}/${key}`;
}

function createS3Body(value: string) {
  return {
    transformToString: async () => value,
  };
}

describe("notifyAttachmentArchiveIntegrity", () => {
  const getSecretMock = vi.mocked(getSecret);
  const s3SendSpy = vi.spyOn(S3Client.prototype, "send");
  const sesSendSpy = vi.spyOn(SESClient.prototype, "send");
  const originalBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  const originalReportPrefix = process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX;
  const originalStageName = process.env.STAGE_NAME;
  const originalEmailAddressLookupSecretName = process.env.emailAddressLookupSecretName;
  const originalAwsRegion = process.env.AWS_REGION;
  const originalAwsDefaultRegion = process.env.AWS_DEFAULT_REGION;

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "archive-write-bucket";
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = "archive-integrity";
    process.env.STAGE_NAME = "main";
    process.env.emailAddressLookupSecretName = "emailAddresses"; // pragma: allowlist secret
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_DEFAULT_REGION = "us-east-1";
    getSecretMock.mockReset();
    s3SendSpy.mockReset();
    sesSendSpy.mockReset();
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = originalBucketName;
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = originalReportPrefix;
    process.env.STAGE_NAME = originalStageName;
    process.env.emailAddressLookupSecretName = originalEmailAddressLookupSecretName;
    process.env.AWS_REGION = originalAwsRegion;
    process.env.AWS_DEFAULT_REGION = originalAwsDefaultRegion;
  });

  function mockS3(objectStore: S3ObjectStore, putStore: S3ObjectStore) {
    s3SendSpy.mockImplementation(async (command: any) => {
      const commandName = command.constructor.name;
      const input = command.input;

      if (commandName === "GetObjectCommand") {
        const value = objectStore.get(toStoreKey(input.Bucket, input.Key));
        if (value === undefined) {
          const notFoundError = new Error("not found");
          (notFoundError as any).name = "NoSuchKey";
          (notFoundError as any).$metadata = { httpStatusCode: 404 };
          throw notFoundError;
        }

        return {
          Body: createS3Body(value),
        } as never;
      }

      if (commandName === "PutObjectCommand") {
        const body =
          typeof input.Body === "string"
            ? input.Body
            : Buffer.from(input.Body || "").toString("utf8");
        putStore.set(toStoreKey(input.Bucket, input.Key), body);
        objectStore.set(toStoreKey(input.Bucket, input.Key), body);
        return {} as never;
      }

      return {} as never;
    });
  }

  it("sends discrepancy emails with csv attachments and updates summary status", async () => {
    getSecretMock.mockResolvedValue(
      JSON.stringify({
        sourceEmail: ['"OneMAC Alerts" <source@example.com>'],
        archiveAlerts: ['"IT Support" <it@example.com>', '"Helpdesk Queue" <helpdesk@example.com>'],
      }),
    );

    const summaryKey = "archive-integrity/main/runs/2026/04/06/run-1/summary.json";
    const csvKey = "archive-integrity/main/runs/2026/04/06/run-1/discrepancies.csv";
    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey("archive-write-bucket", summaryKey),
        JSON.stringify({
          runId: "run-1",
          stage: "main",
          runTimestamp: "2026-04-06T08:00:00.000Z",
          status: "SUCCESS",
          packagesScanned: 10,
          sectionsScanned: 20,
          discrepancyCount: 2,
          discrepancyTypeCounts: {
            SECTION_CROSS_SECTION_BLEED: 1,
            PACKAGE_FILE_MISSING: 1,
          },
          topDiscrepancyTypes: [
            { type: "SECTION_CROSS_SECTION_BLEED", count: 1 },
            { type: "PACKAGE_FILE_MISSING", count: 1 },
          ],
          reportBucketName: "archive-write-bucket",
          reportPrefix: "archive-integrity/main/runs/2026/04/06/run-1",
          discrepancyJsonKey: "archive-integrity/main/runs/2026/04/06/run-1/discrepancies.json",
          discrepancyCsvKey: csvKey,
          discrepancyCsvFilename: "discrepancies.csv",
          discrepancyCsvTruncated: false,
          discrepancyCsvRowsIncluded: 2,
          discrepancyCsvRowsTotal: 2,
          notificationStatus: "PENDING",
        }),
      ],
      [
        toStoreKey("archive-write-bucket", csvKey),
        "authority,packageId,sectionId,cmsStatus,submissionDate,issueScope,discrepancyType,expectedValue,actualValue\nA,MD-1,s1,Submitted,2026-04-06,Section,SECTION_FILE_EXTRA,none,extra",
      ],
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3(objectStore, putStore);

    await handler({
      mode: "discrepancy",
      runResult: {
        reportBucketName: "archive-write-bucket",
        summaryKey,
      },
    });

    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const command = sesSendSpy.mock.calls[0][0];
    expect(command).toEqual(
      expect.objectContaining({
        input: expect.objectContaining({
          Source: "source@example.com",
          Destinations: ["it@example.com", "helpdesk@example.com"],
        }),
      }),
    );
    const rawData = Buffer.from((command.input as any).RawMessage.Data).toString("utf8");
    expect(rawData).toContain('From: "OneMAC Alerts" <source@example.com>');
    expect(rawData).toContain(
      'To: "IT Support" <it@example.com>, "Helpdesk Queue" <helpdesk@example.com>',
    );
    expect(rawData).toContain('filename="discrepancies.csv"');
    expect(rawData).toContain("[main] OneMAC Archive Integrity Discrepancies (2)");

    const updatedSummary = JSON.parse(
      putStore.get(toStoreKey("archive-write-bucket", summaryKey)) || "{}",
    );
    expect(updatedSummary.notificationStatus).toBe("SENT");
    expect(updatedSummary.notificationSentAt).toEqual(expect.any(String));
  });

  it("skips email delivery when discrepancy count is zero", async () => {
    getSecretMock.mockResolvedValue(
      JSON.stringify({
        sourceEmail: ['"OneMAC Alerts" <source@example.com>'],
        archiveAlerts: ['"IT Support" <it@example.com>', '"Helpdesk Queue" <helpdesk@example.com>'],
      }),
    );

    const summaryKey = "archive-integrity/main/runs/2026/04/06/run-2/summary.json";
    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey("archive-write-bucket", summaryKey),
        JSON.stringify({
          runId: "run-2",
          stage: "main",
          runTimestamp: "2026-04-06T08:00:00.000Z",
          status: "SUCCESS",
          packagesScanned: 2,
          sectionsScanned: 4,
          discrepancyCount: 0,
          discrepancyTypeCounts: {},
          topDiscrepancyTypes: [],
          reportBucketName: "archive-write-bucket",
          reportPrefix: "archive-integrity/main/runs/2026/04/06/run-2",
          discrepancyJsonKey: "archive-integrity/main/runs/2026/04/06/run-2/discrepancies.json",
          discrepancyCsvKey: "archive-integrity/main/runs/2026/04/06/run-2/discrepancies.csv",
          discrepancyCsvFilename: "discrepancies.csv",
          discrepancyCsvTruncated: false,
          discrepancyCsvRowsIncluded: 0,
          discrepancyCsvRowsTotal: 0,
          notificationStatus: "PENDING",
        }),
      ],
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3(objectStore, putStore);

    await handler({
      mode: "discrepancy",
      runResult: {
        reportBucketName: "archive-write-bucket",
        summaryKey,
      },
    });

    expect(sesSendSpy).not.toHaveBeenCalled();
    const updatedSummary = JSON.parse(
      putStore.get(toStoreKey("archive-write-bucket", summaryKey)) || "{}",
    );
    expect(updatedSummary.notificationStatus).toBe("SKIPPED");
  });

  it("sends failure alert emails and writes a failed summary when none exists", async () => {
    getSecretMock.mockResolvedValue(
      JSON.stringify({
        sourceEmail: ['"OneMAC Alerts" <source@example.com>'],
        archiveAlerts: ['"IT Support" <it@example.com>', '"Helpdesk Queue" <helpdesk@example.com>'],
      }),
    );
    const objectStore: S3ObjectStore = new Map();
    const putStore: S3ObjectStore = new Map();
    mockS3(objectStore, putStore);

    await handler({
      mode: "failure",
      error: {
        Cause: JSON.stringify({
          errorMessage: JSON.stringify({
            message: "OpenSearch unavailable",
          }),
        }),
      },
    });

    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const command = sesSendSpy.mock.calls[0][0];
    expect(command).toEqual(
      expect.objectContaining({
        input: expect.objectContaining({
          Source: "source@example.com",
          Destinations: ["it@example.com", "helpdesk@example.com"],
        }),
      }),
    );
    const rawData = Buffer.from((command.input as any).RawMessage.Data).toString("utf8");
    expect(rawData).toContain('From: "OneMAC Alerts" <source@example.com>');
    expect(rawData).toContain(
      'To: "IT Support" <it@example.com>, "Helpdesk Queue" <helpdesk@example.com>',
    );
    expect(rawData).toContain("[main] OneMAC Archive Integrity Check Failed");
    expect(rawData).toContain("OpenSearch unavailable");

    const summaryEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/summary.json"),
    );
    expect(summaryEntry).toBeDefined();
    const summary = JSON.parse(summaryEntry?.[1] || "{}");
    expect(summary.status).toBe("FAILED");
    expect(summary.notificationStatus).toBe("SENT");
  });

  it("updates existing run summary on failure when runResult provides summary location", async () => {
    getSecretMock.mockResolvedValue(
      JSON.stringify({
        sourceEmail: ['"OneMAC Alerts" <source@example.com>'],
        archiveAlerts: ['"IT Support" <it@example.com>', '"Helpdesk Queue" <helpdesk@example.com>'],
      }),
    );

    const summaryKey = "archive-integrity/main/runs/2026/04/06/run-3/summary.json";
    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey("archive-write-bucket", summaryKey),
        JSON.stringify({
          runId: "run-3",
          stage: "main",
          runTimestamp: "2026-04-06T08:00:00.000Z",
          status: "SUCCESS",
          packagesScanned: 3,
          sectionsScanned: 6,
          discrepancyCount: 2,
          discrepancyTypeCounts: {
            PACKAGE_FILE_MISSING: 2,
          },
          topDiscrepancyTypes: [{ type: "PACKAGE_FILE_MISSING", count: 2 }],
          reportBucketName: "archive-write-bucket",
          reportPrefix: "archive-integrity/main/runs/2026/04/06/run-3",
          discrepancyJsonKey: "archive-integrity/main/runs/2026/04/06/run-3/discrepancies.json",
          discrepancyCsvKey: "archive-integrity/main/runs/2026/04/06/run-3/discrepancies.csv",
          discrepancyCsvFilename: "discrepancies.csv",
          discrepancyCsvTruncated: false,
          discrepancyCsvRowsIncluded: 2,
          discrepancyCsvRowsTotal: 2,
          notificationStatus: "FAILED",
          notificationError: "prior failure",
        }),
      ],
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3(objectStore, putStore);

    await handler({
      mode: "failure",
      runResult: {
        reportBucketName: "archive-write-bucket",
        summaryKey,
        runId: "run-3",
        stage: "main",
      },
      error: {
        Cause: JSON.stringify({
          errorMessage: "SES delivery failed",
        }),
      },
    });

    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const updatedSummary = JSON.parse(
      putStore.get(toStoreKey("archive-write-bucket", summaryKey)) || "{}",
    );
    expect(updatedSummary.runId).toBe("run-3");
    expect(updatedSummary.notificationStatus).toBe("SENT");
    expect(updatedSummary.errorMessage).toContain("SES delivery failed");
  });
});
