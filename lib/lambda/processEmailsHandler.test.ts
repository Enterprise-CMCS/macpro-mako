import { describe, it, expect, vi } from "vitest";
import * as os from "libs/opensearch-lib";
import { Context } from "aws-lambda";
import { SESClient } from "@aws-sdk/client-ses";
import { handler } from "./processEmails";
import { KafkaRecord, KafkaEvent } from "shared-types";
import { Authority } from "shared-types";
import {
  SIMPLE_ID,
  WITHDRAW_RAI_ITEM_B,
  WITHDRAW_RAI_ITEM_C,
  NOT_FOUND_ITEM_ID,
  WITHDRAW_EMAIL_SENT,
} from "mocks";
const nms = "new-medicaid-submission";
const ncs = "new-chip-submission";
const tempExtension = "temporary-extension";
const withdrawPackage = "withdraw-package";
const contractingInitial = "contracting-initial";
const capitatedInitial = "capitated-initial";
const withdrawRai = "withdraw-rai";
const respondToRai = "respond-to-rai";
const appk = "app-k";
const uploadSubsequentDocuments = "upload-subsequent-documents";

describe("process emails  Handler", () => {
  it.each([
    [
      `should send an email for ${respondToRai} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      respondToRai,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      respondToRai,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915b"]}`,
      Authority["1915b"],
      respondToRai,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${respondToRai} with ${Authority["1915c"]}`,
      Authority["1915c"],
      respondToRai,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${nms} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      nms,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${nms} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      nms,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${nms} with ${Authority["1915b"]}`,
      Authority["1915b"],
      nms,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${nms} with ${Authority["1915c"]}`,
      Authority["1915c"],
      nms,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${ncs} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      ncs,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${ncs} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      ncs,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${ncs} with ${Authority["1915b"]}`,
      Authority["1915b"],
      ncs,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${ncs} with ${Authority["1915c"]}`,
      Authority["1915c"],
      ncs,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915b"]}`,
      Authority["1915b"],
      tempExtension,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915c"]}`,
      Authority["1915c"],
      tempExtension,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      withdrawPackage,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      withdrawPackage,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawPackage} for ${ncs} with ${Authority["1915b"]}`,
      Authority["1915b"],
      withdrawPackage,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${appk} with ${Authority["1915c"]}`,
      Authority["1915c"],
      appk,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      contractingInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      contractingInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915b"]}`,
      Authority["1915b"],
      contractingInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915c"]}`,
      Authority["1915c"],
      contractingInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      capitatedInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      capitatedInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority["1915b"]}`,
      Authority["1915b"],
      capitatedInitial,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${appk} with ${Authority["1915c"]}`,
      Authority["1915c"],
      appk,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${appk} with ${Authority["1915b"]}`,
      Authority["1915b"],
      appk,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915b"]}`,
      Authority["1915b"],
      withdrawRai,
      WITHDRAW_RAI_ITEM_B,
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915c"]}`,
      Authority["1915c"],
      withdrawRai,
      WITHDRAW_RAI_ITEM_C,
    ],
    [
      `should send an email for ${uploadSubsequentDocuments} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      uploadSubsequentDocuments,
      WITHDRAW_RAI_ITEM_B,
    ],
    [
      `should send an email for ${uploadSubsequentDocuments} with ${Authority["1915c"]}`,
      Authority["1915c"],
      uploadSubsequentDocuments,
      WITHDRAW_RAI_ITEM_C,
    ],
  ])("%s", async (_, auth, eventType, id) => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
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
    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(2);
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
