import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { Authority, EmailAddresses } from "shared-types";
import { getSecret } from "shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./runSeatoolMissingRecordEscalation";
import { fetchMissingRecordCandidates } from "./seatool-missing-record/candidates";

vi.mock("./seatool-missing-record/candidates", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./seatool-missing-record/candidates")>();
  return {
    ...actual,
    fetchMissingRecordCandidates: vi.fn(),
  };
});

vi.mock("shared-utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("shared-utils")>();
  return {
    ...actual,
    getSecret: vi.fn(),
  };
});

vi.mock("libs/email/content/seatoolMissingRecord", () => ({
  renderSeatoolMissingRecordEmail: vi.fn(async ({ to, cc = [], packages }) => ({
    to,
    cc,
    subject:
      packages.length === 1
        ? `${packages[0].id} - ACTION REQUIRED - No matching record in SEA Tool`
        : "ACTION REQUIRED - No matching record in SEA Tool",
    body: `<html>${packages.map((row: { id: string }) => row.id).join(",")}</html>`,
    text: packages.map((row: { id: string }) => row.id).join("\n"),
  })),
}));

const fetchCandidatesMock = fetchMissingRecordCandidates as unknown as ReturnType<typeof vi.fn>;
const getSecretMock = getSecret as unknown as ReturnType<typeof vi.fn>;

const emails: EmailAddresses = {
  osgEmail: ["osg@cms.hhs.gov"],
  dpoEmail: [],
  dmcoEmail: [],
  dhcbsooEmail: [],
  chipInbox: ["chip.inbox@cms.hhs.gov"],
  chipCcList: [],
  sourceEmail: "source@example.com",
  srtEmails: [],
  cpocEmail: [],
  accessEmail: "access@example.com",
  seatoolMissingRecordTo: ["missing-record-dev@example.com"],
  seatoolHelpdesk: ["seatool-helpdesk@example.com"],
  dpoApprover: ["dpo-approver@example.com"],
};

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

describe("runSeatoolMissingRecordEscalation", () => {
  const s3SendSpy = vi.spyOn(S3Client.prototype, "send");
  const sesSendSpy = vi.spyOn(SESClient.prototype, "send");
  const originalEnv = {
    STAGE_NAME: process.env.STAGE_NAME,
    SEATOOL_MISSING_RECORD_BUCKET_NAME: process.env.SEATOOL_MISSING_RECORD_BUCKET_NAME,
    SEATOOL_MISSING_RECORD_PREFIX: process.env.SEATOOL_MISSING_RECORD_PREFIX,
    emailAddressLookupSecretName: process.env.emailAddressLookupSecretName,
    region: process.env.region,
  };

  beforeEach(() => {
    process.env.STAGE_NAME = "main";
    process.env.SEATOOL_MISSING_RECORD_BUCKET_NAME = "archive-write-bucket";
    process.env.SEATOOL_MISSING_RECORD_PREFIX = "seatool-missing-record";
    process.env.emailAddressLookupSecretName = "emailAddresses";
    process.env.region = "us-east-1";
    fetchCandidatesMock.mockReset();
    getSecretMock.mockReset();
    getSecretMock.mockResolvedValue(JSON.stringify(emails));
    s3SendSpy.mockReset();
    sesSendSpy.mockReset();
    sesSendSpy.mockResolvedValue({ $metadata: { httpStatusCode: 200 } } as never);
  });

  afterEach(() => {
    restoreEnvValue("STAGE_NAME", originalEnv.STAGE_NAME);
    restoreEnvValue(
      "SEATOOL_MISSING_RECORD_BUCKET_NAME",
      originalEnv.SEATOOL_MISSING_RECORD_BUCKET_NAME,
    );
    restoreEnvValue("SEATOOL_MISSING_RECORD_PREFIX", originalEnv.SEATOOL_MISSING_RECORD_PREFIX);
    restoreEnvValue("emailAddressLookupSecretName", originalEnv.emailAddressLookupSecretName);
    restoreEnvValue("region", originalEnv.region);
  });

  it("skips send when the candidate list is empty", async () => {
    s3SendSpy.mockResolvedValue({ Contents: [] } as never);
    fetchCandidatesMock.mockResolvedValue([]);

    const result = await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(result).toEqual({
      status: "skipped",
      reason: "empty",
      sentGroups: [],
      candidateCount: 0,
    });
    expect(sesSendSpy).not.toHaveBeenCalled();
    expect(s3SendSpy).not.toHaveBeenCalledWith(expect.any(PutObjectCommand));
  });

  it("skips a second send when the same-day marker already exists", async () => {
    s3SendSpy.mockResolvedValue({
      Contents: [{ Key: "seatool-missing-record/main/sent/2023/08/05/digest.json" }],
    } as never);

    const result = await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(result.status).toBe("skipped");
    expect(result.reason).toBe("already-sent");
    expect(fetchCandidatesMock).not.toHaveBeenCalled();
    expect(sesSendSpy).not.toHaveBeenCalled();
  });

  it("writes the same-day marker and sends one SES SendEmail per non-empty group", async () => {
    s3SendSpy.mockImplementation(async (command) => {
      if (command instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      return {};
    });
    fetchCandidatesMock.mockResolvedValue([
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "MD-23-0002",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.CHIP_SPA,
        daysSinceSubmit: 4,
      },
    ]);

    const result = await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(result.status).toBe("sent");
    expect(result.sentGroups).toEqual(["medicaid-spa", "chip-spa"]);
    expect(result.markerKey).toBe("seatool-missing-record/main/sent/2023/08/05/digest.json");
    expect(sesSendSpy).toHaveBeenCalledTimes(2);
    expect(sesSendSpy).toHaveBeenCalledWith(expect.any(SendEmailCommand));
    expect(sesSendSpy.mock.calls.every(([command]) => command instanceof SendEmailCommand)).toBe(
      true,
    );
    expect(s3SendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));

    const putCommand = s3SendSpy.mock.calls
      .map(([command]) => command)
      .find((command) => command instanceof PutObjectCommand) as PutObjectCommand;
    expect(putCommand.input.Bucket).toBe("archive-write-bucket");
    expect(putCommand.input.Key).toBe("seatool-missing-record/main/sent/2023/08/05/digest.json");
    expect(
      sesSendSpy.mock.calls.every(
        ([command]) =>
          command instanceof SendEmailCommand &&
          command.input.Destination?.ToAddresses?.[0] === "missing-record-dev@example.com" &&
          (command.input.Destination?.CcAddresses?.length ?? 0) === 0,
      ),
    ).toBe(true);
  });

  it("uses osg/chip To lists and secret CCs on production", async () => {
    process.env.STAGE_NAME = "production";
    s3SendSpy.mockImplementation(async (command) => {
      if (command instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      return {};
    });
    fetchCandidatesMock.mockResolvedValue([
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
    ]);

    await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const command = sesSendSpy.mock.calls[0][0] as SendEmailCommand;
    expect(command.input.Destination?.ToAddresses).toEqual(["osg@cms.hhs.gov"]);
    expect(command.input.Destination?.CcAddresses).toEqual([
      "seatool-helpdesk@example.com",
      "dpo-approver@example.com",
    ]);
    expect(command.input.Message?.Subject?.Data).toBe(
      "MD-23-0001 - ACTION REQUIRED - No matching record in SEA Tool",
    );
    expect(command.input.Message?.Body?.Text?.Data).toBe("MD-23-0001");
  });

  it("sends one production email per package, including packages that share an authority", async () => {
    process.env.STAGE_NAME = "production";
    s3SendSpy.mockImplementation(async (command) => {
      if (command instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      return {};
    });
    fetchCandidatesMock.mockResolvedValue([
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "VA-23-0008",
        submissionDate: "2023-07-30T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 6,
      },
      {
        id: "CA-23-0002",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.CHIP_SPA,
        daysSinceSubmit: 4,
      },
    ]);

    const result = await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(result.status).toBe("sent");
    expect(result.candidateCount).toBe(3);
    expect(result.sentGroups).toEqual(["medicaid-spa", "chip-spa"]);
    expect(sesSendSpy).toHaveBeenCalledTimes(3);
    const subjects = sesSendSpy.mock.calls.map(([command]) => {
      if (!(command instanceof SendEmailCommand)) {
        return "";
      }
      return command.input.Message?.Subject?.Data;
    });
    expect(subjects).toEqual([
      "MD-23-0001 - ACTION REQUIRED - No matching record in SEA Tool",
      "VA-23-0008 - ACTION REQUIRED - No matching record in SEA Tool",
      "CA-23-0002 - ACTION REQUIRED - No matching record in SEA Tool",
    ]);
    const chipCommand = sesSendSpy.mock.calls[2][0] as SendEmailCommand;
    expect(chipCommand.input.Destination?.ToAddresses).toEqual(["chip.inbox@cms.hhs.gov"]);
  });

  it("groups lower-environment emails by authority", async () => {
    s3SendSpy.mockImplementation(async (command) => {
      if (command instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      return {};
    });
    fetchCandidatesMock.mockResolvedValue([
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "VA-23-0008",
        submissionDate: "2023-07-30T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 6,
      },
    ]);

    await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const command = sesSendSpy.mock.calls[0][0] as SendEmailCommand;
    expect(command.input.Message?.Subject?.Data).toBe(
      "ACTION REQUIRED - No matching record in SEA Tool",
    );
    expect(command.input.Message?.Body?.Html?.Data).toContain("MD-23-0001,VA-23-0008");
    expect(command.input.Destination?.ToAddresses).toEqual(["missing-record-dev@example.com"]);
  });

  it("does not email ZZ or ZT packages", async () => {
    process.env.STAGE_NAME = "production";
    s3SendSpy.mockImplementation(async (command) => {
      if (command instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      return {};
    });
    fetchCandidatesMock.mockResolvedValue([
      {
        id: "ZZ-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
      {
        id: "zt-23-0002",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority["1915b"],
        daysSinceSubmit: 8,
      },
      {
        id: "MD-23-0001",
        submissionDate: "2023-08-01T12:00:00-04:00",
        authority: Authority.MED_SPA,
        daysSinceSubmit: 4,
      },
    ]);

    const result = await handler({ now: "2023-08-05T12:00:00-04:00" });

    expect(result.status).toBe("sent");
    expect(result.candidateCount).toBe(1);
    expect(sesSendSpy).toHaveBeenCalledTimes(1);
    const command = sesSendSpy.mock.calls[0][0] as SendEmailCommand;
    expect(command.input.Message?.Subject?.Data).toContain("MD-23-0001");
    expect(command.input.Message?.Body?.Html?.Data).not.toContain("ZZ-23-0001");
  });
});
