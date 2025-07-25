import { SESClient } from "@aws-sdk/client-ses";
import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import {
  NOT_FOUND_ITEM_ID,
  SIMPLE_ID,
  WITHDRAW_EMAIL_SENT,
  WITHDRAW_RAI_ITEM_B,
  WITHDRAW_RAI_ITEM_C,
  WITHDRAW_RAI_ITEM_D,
  WITHDRAW_RAI_ITEM_E,
} from "mocks";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { Authority } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./processEmails";
const nms = "new-medicaid-submission";
const ncs = "new-chip-submission";
const tempExtension = "temporary-extension";
const withdrawPackage = "withdraw-package";
const contractingInitial = "contracting-initial";
const capitatedInitial = "capitated-initial";
const withdrawRai = "withdraw-rai";
const respondToRai = "respond-to-rai";
const uploadSubsequentDocuments = "upload-subsequent-documents";
import { calculate90dayExpiration } from "./utils";

describe("process emails  Handler", () => {
  it.each([
    [
      `should send an email for ${respondToRai} with ${Authority.MED_SPA}`,
      {
        authority: Authority.MED_SPA,
        event: respondToRai,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${respondToRai} with ${Authority.CHIP_SPA}`,
      {
        authority: Authority.CHIP_SPA,
        event: respondToRai,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: respondToRai,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915c"]}`,
      {
        authority: Authority["1915c"],
        event: respondToRai,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${nms} with ${Authority.MED_SPA}`,
      {
        authority: Authority.MED_SPA,
        event: nms,
        id: SIMPLE_ID,
        proposedEffectiveDate: 1732645041557,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${nms} with ${Authority.CHIP_SPA}`,
      { authority: Authority.CHIP_SPA, event: nms, id: SIMPLE_ID, timestamp: 1732645041557 },
    ],
    [
      `should send an email for ${ncs} with ${Authority.CHIP_SPA}`,
      { authority: Authority.CHIP_SPA, event: ncs, id: SIMPLE_ID, timestamp: 1732645041557 },
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: tempExtension,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915c"]}`,
      {
        authority: Authority["1915c"],
        event: tempExtension,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.MED_SPA}`,
      {
        authority: Authority.MED_SPA,
        event: withdrawPackage,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.CHIP_SPA}`,
      {
        authority: Authority.CHIP_SPA,
        event: withdrawPackage,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawPackage} for ${ncs} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: withdrawPackage,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: contractingInitial,
        proposedEffectiveDate: 1732645041557,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915c"]}`,
      {
        authority: Authority["1915c"],
        event: contractingInitial,
        proposedEffectiveDate: 1732645041557,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: capitatedInitial,
        proposedEffectiveDate: 1732645041557,
        id: SIMPLE_ID,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915b"]}`,
      {
        authority: Authority["1915b"],
        event: withdrawRai,
        id: WITHDRAW_RAI_ITEM_B,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915c"]}`,
      {
        authority: Authority["1915c"],
        event: withdrawRai,
        id: WITHDRAW_RAI_ITEM_C,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["CHIP_SPA"]}`,
      {
        authority: Authority["CHIP_SPA"],
        event: withdrawRai,
        id: WITHDRAW_RAI_ITEM_D,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["MED_SPA"]}`,
      {
        authority: Authority["MED_SPA"],
        event: withdrawRai,
        id: WITHDRAW_RAI_ITEM_E,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${uploadSubsequentDocuments} with ${Authority.CHIP_SPA}`,
      {
        authority: Authority.CHIP_SPA,
        event: uploadSubsequentDocuments,
        id: WITHDRAW_RAI_ITEM_B,
        timestamp: 1732645041557,
      },
    ],
    [
      `should send an email for ${uploadSubsequentDocuments} with ${Authority["1915c"]}`,
      {
        authority: Authority["1915c"],
        event: uploadSubsequentDocuments,
        id: WITHDRAW_RAI_ITEM_C,
        timestamp: 1732645041557,
      },
    ],
  ])("%s", async (_, record) => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
    const { id, ...restOfRecord } = record;
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(id).toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                origin: "mako",
                ...restOfRecord,
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(2);
  });
});
describe("process emails  Handler failures", () => {
  it.each([
    [
      `should send an email for ${withdrawRai} with ${Authority["1915b"]}`,
      Authority["1915b"],
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915c"]}`,
      Authority["1915c"],
      SIMPLE_ID,
    ],
  ])("%s", async (_, auth, eventType, id = SIMPLE_ID) => {
    const callback = vi.fn();
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(id).toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                origin: "mako",
                event: eventType,
                authority: auth,
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await expect(() => handler(mockEvent, {} as Context, callback)).rejects.toThrow();
  });
});
const seatoolData = (authority: string) => ({
  ACTION_OFFICERS: [
    {
      OFFICER_ID: 1,
      FIRST_NAME: "OFFICER",
      LAST_NAME: "ACTION",
      EMAIL: "OFFICER_TEST@THISISFAKE",
    },
  ],
  LEAD_ANALYST: [
    { OFFICER_ID: 2, FIRST_NAME: "ANALYST", LAST_NAME: "LEAD", EMAIL: "ANALYST_TEST@THISISFAKE" },
  ],
  STATE_PLAN_SERVICETYPES: [
    { SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Medical" },
    { SPA_TYPE_ID: 2, SPA_TYPE_NAME: "Dental" },
  ],
  STATE_PLAN_SERVICE_SUBTYPES: [
    { TYPE_ID: 101, TYPE_NAME: "Emergency" },
    { TYPE_ID: 102, TYPE_NAME: "Routine Checkup" },
  ],
  STATE_PLAN: {
    SUBMISSION_DATE: 1704067200,
    PLAN_TYPE: 122,
    LEAD_ANALYST_ID: 45,
    APPROVED_EFFECTIVE_DATE: 1706659200,
    ACTUAL_EFFECTIVE_DATE: 1706659200,
    PROPOSED_DATE: 1709251200,
    SPW_STATUS_ID: 6,
    STATE_CODE: "MD",
    STATUS_DATE: 1709347600,
    SUMMARY_MEMO: "Plan revision to include telehealth services.",
    TITLE_NAME: "State Health Plan 2025",
    CHANGED_DATE: 1709450000,
  },
  RAI: [
    {
      RAI_RECEIVED_DATE: 1704556800,
      RAI_REQUESTED_DATE: 1704067200,
      RAI_WITHDRAWN_DATE: 1704067201,
    },
  ],
  ACTIONTYPES: [
    { ACTION_ID: 10, ACTION_NAME: "Initial Review", PLAN_TYPE_ID: 3 },
    { ACTION_ID: 11, ACTION_NAME: "Final Approval", PLAN_TYPE_ID: 3 },
  ],
  authority: authority,
});
describe("process emails  Handler for seatool", () => {
  vi.spyOn(os, "updateData").mockImplementation(vi.fn());
  it.each([
    [
      `should send an email for ${respondToRai} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915b"]}`,
      Authority["1915b"],
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915c"]}`,
      Authority["1915c"],
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      SIMPLE_ID,
    ],
  ])("%s", async (_, auth, id) => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
    const data = seatoolData(auth);
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(id).toString("base64"),
            value: Buffer.from(JSON.stringify(data)).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "aws.seatool.ksql.onemac.three.agg.State_Plan",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(1);
  });
  it("should not find the item ID and do nothing", async () => {
    const callback = vi.fn();
    const consoleSpy = vi.spyOn(console, "log");
    const data = seatoolData(Authority.MED_SPA);
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(NOT_FOUND_ITEM_ID).toString("base64"),
            value: Buffer.from(JSON.stringify(data)).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "aws.seatool.ksql.onemac.three.agg.State_Plan",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await handler(mockEvent, {} as Context, callback);
    expect(consoleSpy).toHaveBeenCalledWith(
      `The package was not found for id: ${NOT_FOUND_ITEM_ID} in mako. Doing nothing.`,
    );
  });
  it("A withdraw email was already sent", async () => {
    const callback = vi.fn();
    const consoleSpy = vi.spyOn(console, "log");
    const data = seatoolData(Authority.MED_SPA);
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(WITHDRAW_EMAIL_SENT).toString("base64"),
            value: Buffer.from(JSON.stringify(data)).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "aws.seatool.ksql.onemac.three.agg.State_Plan",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await handler(mockEvent, {} as Context, callback);
    expect(consoleSpy).toHaveBeenCalledWith("Withdraw email previously sent");
  });
});

describe("calculate90dayExpiration", () => {
  const mockConfig = {
    osDomain: "fakeDomain",
    indexNamespace: "main",
    region: "us-east-1",
  } as any;

  const parsedRecord = {
    id: "OH-1234-56",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers(); // clean up
  });

  it("should calculate 90-day expiration date with paused duration", async () => {
    // Mock submissionDate = Jan 1 2025, RAI requested = Jan 31 2025
    const submissionDate = "2025-01-01T00:00:00Z";
    const raiRequestedDate = "2025-01-31T00:00:00Z";

    const expectedNow = new Date("2025-03-01T00:00:00Z").getTime();
    vi.setSystemTime(expectedNow);

    vi.spyOn(os, "getItem").mockResolvedValue({
      _source: {
        submissionDate,
        raiRequestedDate,
      },
    } as any);

    const result = await calculate90dayExpiration(parsedRecord as any, mockConfig);

    const submissionMS = new Date(submissionDate).getTime();
    const raiMS = new Date(raiRequestedDate).getTime();
    const pausedDuration = expectedNow - raiMS;
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const expectedExpiration = submissionMS + ninetyDays + pausedDuration;

    expect(result).toBe(expectedExpiration);
  });

  it("should log an error if submissionDate or raiRequestedDate is missing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(os, "getItem").mockResolvedValue({
      _source: {
        submissionDate: "2025-01-31T00:00:00Z",
        raiRequestedDate: null, // Missing RAI date
      },
    } as any);

    const result = await calculate90dayExpiration(parsedRecord as any, mockConfig);

    expect(consoleSpy).toHaveBeenCalledWith("error parsing os record");
    expect(result).toBeUndefined();
  });
});
