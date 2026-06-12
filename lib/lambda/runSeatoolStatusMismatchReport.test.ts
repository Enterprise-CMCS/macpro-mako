import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { mockedAdmin, mockedConsumer } from "mocks/helpers/kafka.utils";
import { getSecret } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getClient } from "../libs/opensearch-lib";
import {
  compareSeatoolToOneMac,
  handler,
  normalizeStatus,
  normalizeStatusComparisonKey,
  parseCsvRows,
  parseSeatoolKafkaStatusRow,
  parseSeatoolStatusRows,
} from "./runSeatoolStatusMismatchReport";

vi.mock("../libs/opensearch-lib", () => ({
  getClient: vi.fn(),
}));

vi.mock("shared-utils", () => ({
  getSecret: vi.fn(),
}));

type S3ObjectStore = Map<string, string>;

function toStoreKey(bucket: string, key: string) {
  return `${bucket}/${key}`;
}

function buildS3GetBody(value: string) {
  return {
    transformToString: async () => value,
  };
}

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

describe("runSeatoolStatusMismatchReport", () => {
  const s3SendSpy = vi.spyOn(S3Client.prototype, "send");
  const sesSendSpy = vi.spyOn(SESClient.prototype, "send");
  const originalEnv = {
    STAGE_NAME: process.env.STAGE_NAME,
    SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME:
      process.env.SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME,
    SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME:
      process.env.SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME,
    SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX: process.env.SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX,
    SEATOOL_STATUS_MISMATCH_REPORT_PREFIX: process.env.SEATOOL_STATUS_MISMATCH_REPORT_PREFIX,
    SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE:
      process.env.SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE,
    SEATOOL_STATUS_MISMATCH_INPUT_SOURCE: process.env.SEATOOL_STATUS_MISMATCH_INPUT_SOURCE,
    SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC: process.env.SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC,
    SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS:
      process.env.SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS,
    SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS: process.env.SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS,
    emailAddressLookupSecretName: process.env.emailAddressLookupSecretName,
    brokerString: process.env.brokerString,
    osDomain: process.env.osDomain,
    indexNamespace: process.env.indexNamespace,
  };

  beforeEach(() => {
    process.env.STAGE_NAME = "main";
    process.env.SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME = "report-bucket";
    process.env.SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME = "report-bucket";
    process.env.SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX = "seatool-status-mismatch/main/input/";
    process.env.SEATOOL_STATUS_MISMATCH_REPORT_PREFIX = "seatool-status-mismatch";
    process.env.SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE = "2";
    process.env.SEATOOL_STATUS_MISMATCH_INPUT_SOURCE = "KAFKA";
    process.env.SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC =
      "aws.seatool.ksql.onemac.three.agg.State_Plan";
    process.env.SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS = "1000";
    process.env.SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS = "James.d@globalalliantinc.com";
    process.env.emailAddressLookupSecretName = "emailAddresses"; // pragma: allowlist secret
    process.env.brokerString = "broker1,broker2";
    process.env.osDomain = "https://test-opensearch.example.com";
    process.env.indexNamespace = "main";
    s3SendSpy.mockReset();
    sesSendSpy.mockReset();
    sesSendSpy.mockResolvedValue({} as never);
    vi.mocked(getClient).mockReset();
    vi.mocked(getSecret).mockReset();
    vi.mocked(getSecret).mockResolvedValue(
      JSON.stringify({
        sourceEmail: ['"OneMAC Alerts" <source@example.com>'],
      }),
    );
    mockedAdmin.connect.mockResolvedValue(undefined);
    mockedAdmin.disconnect.mockResolvedValue(undefined);
    mockedAdmin.fetchTopicOffsets.mockResolvedValue([
      {
        partition: 0,
        high: "0",
        low: "0",
        offset: "0",
      },
    ]);
    mockedConsumer.connect.mockResolvedValue(undefined);
    mockedConsumer.disconnect.mockResolvedValue(undefined);
    mockedConsumer.subscribe.mockResolvedValue(undefined);
    mockedConsumer.run.mockResolvedValue(undefined);
  });

  afterEach(() => {
    restoreEnvValue("STAGE_NAME", originalEnv.STAGE_NAME);
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME",
      originalEnv.SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME",
      originalEnv.SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX",
      originalEnv.SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_REPORT_PREFIX",
      originalEnv.SEATOOL_STATUS_MISMATCH_REPORT_PREFIX,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE",
      originalEnv.SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_INPUT_SOURCE",
      originalEnv.SEATOOL_STATUS_MISMATCH_INPUT_SOURCE,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC",
      originalEnv.SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS",
      originalEnv.SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS,
    );
    restoreEnvValue(
      "SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS",
      originalEnv.SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS,
    );
    restoreEnvValue("emailAddressLookupSecretName", originalEnv.emailAddressLookupSecretName);
    restoreEnvValue("brokerString", originalEnv.brokerString);
    restoreEnvValue("osDomain", originalEnv.osDomain);
    restoreEnvValue("indexNamespace", originalEnv.indexNamespace);
  });

  function mockS3({
    objectStore,
    putStore,
  }: {
    objectStore: S3ObjectStore;
    putStore: S3ObjectStore;
  }) {
    s3SendSpy.mockImplementation(async (command: any) => {
      const commandName = command.constructor.name;
      const input = command.input;

      if (commandName === "ListObjectsV2Command") {
        const keys = Array.from(objectStore.keys())
          .filter((key) => key.startsWith(`${input.Bucket}/${input.Prefix || ""}`))
          .map((key) => key.slice(input.Bucket.length + 1))
          .sort();

        return {
          Contents: keys.map((key) => ({
            Key: key,
            LastModified: key.endsWith("new.csv")
              ? new Date("2026-03-02T00:00:00Z")
              : new Date("2026-03-01T00:00:00Z"),
          })),
          IsTruncated: false,
        } as never;
      }

      if (commandName === "GetObjectCommand") {
        const value = objectStore.get(toStoreKey(input.Bucket, input.Key));
        if (value === undefined) {
          throw new Error(`Missing test object: ${input.Bucket}/${input.Key}`);
        }

        return {
          Body: buildS3GetBody(value),
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

  it("normalizes status values like the manual comparison script", () => {
    expect(normalizeStatus("Pending - RAI")).toBe("Pending-RAI");
    expect(normalizeStatus("Pending – RAI")).toBe("Pending-RAI");
    expect(normalizeStatus("Package Withdrawn")).toBe("Withdrawn");
    expect(normalizeStatus("  Submitted   -   Intake Needed  ")).toBe("Submitted-Intake Needed");
    expect(normalizeStatusComparisonKey("pending - rai")).toBe("pending-rai");
    expect(normalizeStatusComparisonKey("date sent to cas")).toBe("date sent to cas");
  });

  it("parses SEATool CSV rows with quoted commas and separator rows", () => {
    const rows = parseCsvRows('ID_Number,status,notes\n"MD-1","Pending - RAI","a, b"\n');
    expect(rows).toEqual([
      ["ID_Number", "status", "notes"],
      ["MD-1", "Pending - RAI", "a, b"],
    ]);

    const seatoolRows = parseSeatoolStatusRows(
      "ID_Number,status,\n---------,------,\nMD-1,Pending - RAI,\n",
    );
    expect(seatoolRows).toEqual([
      expect.objectContaining({
        id: "MD-1",
        status: "Pending - RAI",
      }),
    ]);
  });

  it("parses raw SEATool Kafka status IDs into report rows", () => {
    expect(
      parseSeatoolKafkaStatusRow({
        key: Buffer.from('"CA-25-0022"'),
        value: Buffer.from(JSON.stringify({ STATE_PLAN: { SPW_STATUS_ID: 2 } })),
      }),
    ).toEqual({
      id: "CA-25-0022",
      status: "Pending-RAI",
      row: {
        ID_Number: "CA-25-0022",
        SPW_STATUS_ID: "2",
        status: "Pending-RAI",
      },
    });
  });

  it("compares SEATool rows to OneMAC records with mismatch-only output", () => {
    const seatoolRows = parseSeatoolStatusRows(
      [
        "ID_Number,status,",
        "CA-25-0022,Pending-RAI,",
        "CO-25-0044,Approved,",
        "TX-25-0001,Package Withdrawn,",
        "CASE-25-0001,pending - rai,",
        "CAS-25-0001,date sent to cas,",
        "MISSING-25-0001,Approved,",
      ].join("\n"),
    );
    const result = compareSeatoolToOneMac(
      seatoolRows,
      new Map([
        [
          "CA-25-0022",
          {
            id: "CA-25-0022",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Submitted",
            seatoolStatus: "Submitted",
          },
        ],
        ["CO-25-0044", { id: "CO-25-0044", cmsStatus: "Approved", seatoolStatus: "Approved" }],
        ["TX-25-0001", { id: "TX-25-0001", cmsStatus: "Withdrawn", seatoolStatus: "Withdrawn" }],
        [
          "CASE-25-0001",
          { id: "CASE-25-0001", cmsStatus: "Pending-RAI", seatoolStatus: "Pending-RAI" },
        ],
        ["CAS-25-0001", { id: "CAS-25-0001", cmsStatus: "Approved", seatoolStatus: "Approved" }],
      ]),
    );

    expect(result).toEqual({
      comparableRows: 4,
      missingOneMacCount: 1,
      skippedRows: 1,
      mismatchRows: [
        {
          ID_Number: "CA-25-0022",
          status: "Pending-RAI",
          cmsStatus: "Submitted - Intake Needed",
          stateStatus: "Submitted",
          seatoolStatus: "Submitted",
          expectedCmsStatus: "Pending - RAI",
          expectedStateStatus: "RAI Issued",
          classification: "NEEDS_RAI_CHANGELOG_REVIEW",
          actionType: "",
          authority: "",
          id: "CA-25-0022",
        },
      ],
    });
  });

  it("uses OneMAC status display and deterministic sink priority rules before reporting mismatches", () => {
    const seatoolRows = parseSeatoolStatusRows(
      [
        "ID_Number,status,",
        "FINANCE-25-0001,Pending-Finance,",
        "WITHDRAW-25-0001,Pending,",
        "WITHDRAW-25-0002,Pending-RAI,",
        "WITHDRAW-25-0003,Approved,",
        "RAI-WITHDRAW-25-0001,Pending,",
        "RAI-WITHDRAW-25-0002,Pending-RAI,",
        "SUBMITTED-RAI-25-0001,Pending-RAI,",
        "SUBMITTED-PENDING-25-0001,Pending,",
        "TEMP-EXT-25-0001,Pending,",
      ].join("\n"),
    );

    const result = compareSeatoolToOneMac(
      seatoolRows,
      new Map([
        [
          "FINANCE-25-0001",
          {
            id: "FINANCE-25-0001",
            cmsStatus: "Unknown",
            stateStatus: "Unknown",
            seatoolStatus: "Pending-Finance",
          },
        ],
        [
          "WITHDRAW-25-0001",
          {
            id: "WITHDRAW-25-0001",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Withdrawal Requested",
            seatoolStatus: "Withdrawal Requested",
          },
        ],
        [
          "WITHDRAW-25-0002",
          {
            id: "WITHDRAW-25-0002",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Withdrawal Requested",
            seatoolStatus: "Withdrawal Requested",
          },
        ],
        [
          "WITHDRAW-25-0003",
          {
            id: "WITHDRAW-25-0003",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Withdrawal Requested",
            seatoolStatus: "Withdrawal Requested",
          },
        ],
        [
          "RAI-WITHDRAW-25-0001",
          {
            id: "RAI-WITHDRAW-25-0001",
            cmsStatus: "Formal RAI Response - Withdrawal Requested",
            stateStatus: "Formal RAI Response - Withdrawal Requested",
            seatoolStatus: "Formal RAI Response - Withdrawal Requested",
          },
        ],
        [
          "RAI-WITHDRAW-25-0002",
          {
            id: "RAI-WITHDRAW-25-0002",
            cmsStatus: "Formal RAI Response - Withdrawal Requested",
            stateStatus: "Formal RAI Response - Withdrawal Requested",
            seatoolStatus: "Formal RAI Response - Withdrawal Requested",
          },
        ],
        [
          "SUBMITTED-RAI-25-0001",
          {
            id: "SUBMITTED-RAI-25-0001",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Submitted",
            seatoolStatus: "Submitted",
          },
        ],
        [
          "SUBMITTED-PENDING-25-0001",
          {
            id: "SUBMITTED-PENDING-25-0001",
            cmsStatus: "Submitted - Intake Needed",
            stateStatus: "Submitted",
            seatoolStatus: "Submitted",
          },
        ],
        [
          "TEMP-EXT-25-0001",
          {
            id: "TEMP-EXT-25-0001",
            actionType: "Extend",
            authority: "1915(c)",
            cmsStatus: "Requested",
            stateStatus: "Submitted",
            seatoolStatus: "Pending",
          },
        ],
      ]),
    );

    expect(result).toEqual({
      comparableRows: 9,
      missingOneMacCount: 0,
      skippedRows: 0,
      mismatchRows: [
        {
          ID_Number: "RAI-WITHDRAW-25-0002",
          status: "Pending-RAI",
          cmsStatus: "Formal RAI Response - Withdrawal Requested",
          stateStatus: "Formal RAI Response - Withdrawal Requested",
          seatoolStatus: "Formal RAI Response - Withdrawal Requested",
          expectedCmsStatus: "Pending - RAI",
          expectedStateStatus: "RAI Issued",
          classification: "STALE_ONEMAC_STATUS",
          actionType: "",
          authority: "",
          id: "RAI-WITHDRAW-25-0002",
        },
        {
          ID_Number: "SUBMITTED-RAI-25-0001",
          status: "Pending-RAI",
          cmsStatus: "Submitted - Intake Needed",
          stateStatus: "Submitted",
          seatoolStatus: "Submitted",
          expectedCmsStatus: "Pending - RAI",
          expectedStateStatus: "RAI Issued",
          classification: "NEEDS_RAI_CHANGELOG_REVIEW",
          actionType: "",
          authority: "",
          id: "SUBMITTED-RAI-25-0001",
        },
        {
          ID_Number: "SUBMITTED-PENDING-25-0001",
          status: "Pending",
          cmsStatus: "Submitted - Intake Needed",
          stateStatus: "Submitted",
          seatoolStatus: "Submitted",
          expectedCmsStatus: "Pending",
          expectedStateStatus: "Under Review",
          classification: "STALE_ONEMAC_STATUS",
          actionType: "",
          authority: "",
          id: "SUBMITTED-PENDING-25-0001",
        },
      ],
    });
  });

  it("reads the SEATool CSV from S3, compares with OpenSearch, and writes report artifacts", async () => {
    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey("report-bucket", "seatool-status-mismatch/main/input/output.csv"),
        [
          "ID_Number,status,",
          "---------,------,",
          "CA-25-0022,Pending-RAI,",
          "CO-25-0044,Approved,",
          "TX-25-0001,Package Withdrawn,",
          "CAS-25-0001,Date Sent to CAS,",
          "MISSING-25-0001,Approved,",
        ].join("\n"),
      ],
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3({ objectStore, putStore });

    const mget = vi.fn(async ({ body }: { body: { ids: string[] } }) => ({
      body: {
        docs: body.ids.map((id) => {
          if (id === "MISSING-25-0001") {
            return { _id: id, found: false };
          }

          const records: Record<string, any> = {
            "CA-25-0022": {
              id,
              cmsStatus: "Submitted - Intake Needed",
              stateStatus: "Submitted",
              seatoolStatus: "Submitted",
            },
            "CO-25-0044": {
              id,
              cmsStatus: "Approved",
              stateStatus: "Approved",
              seatoolStatus: "Approved",
            },
            "TX-25-0001": {
              id,
              cmsStatus: "Withdrawn",
              stateStatus: "Package Withdrawn",
              seatoolStatus: "Withdrawn",
            },
            "CAS-25-0001": {
              id,
              cmsStatus: "Approved",
              stateStatus: "Approved",
              seatoolStatus: "Approved",
            },
          };

          return {
            _id: id,
            found: true,
            _source: records[id],
          };
        }),
      },
    }));
    vi.mocked(getClient).mockResolvedValue({ mget } as any);

    const result = await handler({
      seatoolCsvKey: "seatool-status-mismatch/main/input/output.csv",
      runTimestamp: "2026-03-19T16:45:07.000Z",
    });

    expect(result).toEqual(
      expect.objectContaining({
        status: "COMPLETE",
        stage: "main",
        inputSource: "CSV",
        inputBucketName: "report-bucket",
        inputKey: "seatool-status-mismatch/main/input/output.csv",
        seatoolRowsLoaded: 5,
        oneMacRecordsRequested: 5,
        oneMacRecordsFound: 4,
        missingOneMacCount: 1,
        comparableRows: 3,
        skippedRows: 1,
        mismatchCount: 1,
        notificationStatus: "SENT",
        notificationRecipients: ["James.d@globalalliantinc.com"],
      }),
    );
    expect(mget).toHaveBeenCalledTimes(3);
    expect(sesSendSpy).toHaveBeenCalledTimes(1);

    const sesCommand = sesSendSpy.mock.calls[0]?.[0] as any;
    expect(sesCommand.input.Destinations).toEqual(["James.d@globalalliantinc.com"]);
    const rawEmail = Buffer.from(sesCommand.input.RawMessage.Data).toString("utf8");
    expect(rawEmail).toContain("Subject: [main] OneMAC/SEATool status mismatches: 1");
    expect(rawEmail).toContain('filename="true_status_mismatches.csv"');

    const csvEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/true_status_mismatches.csv"),
    );
    expect(csvEntry?.[1]).toBe(
      [
        "ID_Number,status,cmsStatus,stateStatus,seatoolStatus,expectedCmsStatus,expectedStateStatus,classification,actionType,authority,id",
        "CA-25-0022,Pending-RAI,Submitted - Intake Needed,Submitted,Submitted,Pending - RAI,RAI Issued,NEEDS_RAI_CHANGELOG_REVIEW,,,CA-25-0022",
      ].join("\n"),
    );

    const summaryEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/summary.json"),
    );
    expect(JSON.parse(summaryEntry?.[1] || "{}")).toEqual(
      expect.objectContaining({
        mismatchCsvFilename: "true_status_mismatches.csv",
        mismatchCount: 1,
        mismatchCountsByClassification: {
          NEEDS_RAI_CHANGELOG_REVIEW: 1,
        },
        notificationStatus: "SENT",
      }),
    );
  });

  it("uses the latest CSV under the configured input prefix when no explicit key is provided", async () => {
    process.env.SEATOOL_STATUS_MISMATCH_INPUT_SOURCE = "CSV";
    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey("report-bucket", "seatool-status-mismatch/main/input/old.csv"),
        "ID_Number,status,\nMD-1,Approved,\n",
      ],
      [
        toStoreKey("report-bucket", "seatool-status-mismatch/main/input/new.csv"),
        "ID_Number,status,\nMD-2,Approved,\n",
      ],
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3({ objectStore, putStore });

    vi.mocked(getClient).mockResolvedValue({
      mget: vi.fn(async ({ body }: { body: { ids: string[] } }) => ({
        body: {
          docs: body.ids.map((id) => ({
            _id: id,
            found: true,
            _source: {
              id,
              cmsStatus: "Approved",
              seatoolStatus: "Approved",
            },
          })),
        },
      })),
    } as any);

    const result = await handler({
      runTimestamp: "2026-03-19T16:45:07.000Z",
    });

    expect(result.inputKey).toBe("seatool-status-mismatch/main/input/new.csv");
    expect(result.mismatchCount).toBe(0);
    expect(result.notificationStatus).toBe("SKIPPED");
    expect(sesSendSpy).not.toHaveBeenCalled();
  });

  it("reads the SEATool status snapshot from the compacted Kafka topic by default", async () => {
    const objectStore: S3ObjectStore = new Map();
    const putStore: S3ObjectStore = new Map();
    mockS3({ objectStore, putStore });

    mockedAdmin.fetchTopicOffsets.mockResolvedValue([
      {
        partition: 0,
        high: "3",
        low: "0",
        offset: "3",
      },
    ]);
    mockedConsumer.run.mockImplementation(async ({ eachBatch }: any) => {
      await eachBatch({
        batch: {
          partition: 0,
          messages: [
            {
              offset: "0",
              key: Buffer.from('"CA-25-0022"'),
              value: Buffer.from(JSON.stringify({ STATE_PLAN: { SPW_STATUS_ID: 2 } })),
            },
            {
              offset: "1",
              key: Buffer.from('"CO-25-0044"'),
              value: Buffer.from(JSON.stringify({ STATE_PLAN: { SPW_STATUS_ID: 4 } })),
            },
            {
              offset: "2",
              key: Buffer.from('"TX-25-0001"'),
              value: Buffer.from(JSON.stringify({ STATE_PLAN: { SPW_STATUS_ID: 6 } })),
            },
          ],
        },
        heartbeat: vi.fn(),
        isRunning: () => true,
        isStale: () => false,
        resolveOffset: vi.fn(),
      });
    });

    const mget = vi.fn(async ({ body }: { body: { ids: string[] } }) => ({
      body: {
        docs: body.ids.map((id) => {
          const records: Record<string, any> = {
            "CA-25-0022": {
              id,
              cmsStatus: "Submitted - Intake Needed",
              stateStatus: "Submitted",
              seatoolStatus: "Submitted",
            },
            "CO-25-0044": {
              id,
              cmsStatus: "Approved",
              stateStatus: "Approved",
              seatoolStatus: "Approved",
            },
            "TX-25-0001": {
              id,
              cmsStatus: "Withdrawn",
              stateStatus: "Package Withdrawn",
              seatoolStatus: "Withdrawn",
            },
          };

          return {
            _id: id,
            found: true,
            _source: records[id],
          };
        }),
      },
    }));
    vi.mocked(getClient).mockResolvedValue({ mget } as any);

    const result = await handler({
      runTimestamp: "2026-03-19T16:45:07.000Z",
    });

    expect(result).toEqual(
      expect.objectContaining({
        inputSource: "KAFKA",
        kafkaTopic: "aws.seatool.ksql.onemac.three.agg.State_Plan",
        kafkaRecordsRead: 3,
        seatoolRowsLoaded: 3,
        mismatchCount: 1,
        notificationStatus: "SENT",
      }),
    );
    expect(mockedConsumer.subscribe).toHaveBeenCalledWith({
      topic: "aws.seatool.ksql.onemac.three.agg.State_Plan",
      fromBeginning: true,
    });

    const csvEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/true_status_mismatches.csv"),
    );
    expect(csvEntry?.[1]).toBe(
      [
        "ID_Number,status,cmsStatus,stateStatus,seatoolStatus,expectedCmsStatus,expectedStateStatus,classification,actionType,authority,id",
        "CA-25-0022,Pending-RAI,Submitted - Intake Needed,Submitted,Submitted,Pending - RAI,RAI Issued,NEEDS_RAI_CHANGELOG_REVIEW,,,CA-25-0022",
      ].join("\n"),
    );
  });
});
