import { describe, it, expect, vi } from "vitest";
import { Context } from "aws-lambda";
import { SESClient } from "@aws-sdk/client-ses";
import { handler } from "./processEmails";
import { KafkaRecord, KafkaEvent } from "shared-types";
import { Authority } from "shared-types";
import { SIMPLE_ID, WITHDRAW_RAI_ITEM_B, WITHDRAW_RAI_ITEM_C } from "mocks";
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
export const seatoolData = {
  ACTION_OFFICERS: null,
  LEAD_ANALYST: [],
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
    PLAN_TYPE: 3,
    LEAD_ANALYST_ID: 45,
    APPROVED_EFFECTIVE_DATE: 1706659200,
    ACTUAL_EFFECTIVE_DATE: null,
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
};
describe("process emails  Handler", () => {
  it.each([
    [
      `should send an email for ${respondToRai} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      respondToRai,
      SIMPLE_ID,
    ],
  ])("%s", async (_, auth, eventType, id) => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from(id).toString("base64"),
            value: Buffer.from(JSON.stringify(seatoolData)).toString("base64"),
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
    expect(secSPY).toHaveBeenCalledTimes(2);
  });
});
