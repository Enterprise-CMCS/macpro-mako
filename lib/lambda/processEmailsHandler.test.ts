import { describe, it, expect, vi } from "vitest";
import { Context } from "aws-lambda";
import { SESClient } from "@aws-sdk/client-ses";
import { handler } from "./processEmails";
import { KafkaRecord, KafkaEvent } from "shared-types";
import { Authority } from "shared-types";
import { SIMPLE_ID, WITHDRAW_RAI_ITEM_B, WITHDRAW_RAI_ITEM_C } from "mocks";
const nms = "new-medicaid-submission";
const ncs = "new-chip-submission";
const tempExtension = "temp-extension";
const withdrawPackage = "withdraw-package";
const contractingInitial = "contracting-initial";
const capitatedInitial = "capitated-initial";
const withdrawRai = "withdraw-rai";

describe("process emails  Handler", () => {
  it.each([
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
      `should send an email for ${tempExtension} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      tempExtension,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      tempExtension,
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
      `should send an email for ${withdrawPackage} with ${Authority["1915c"]}`,
      Authority["1915c"],
      withdrawPackage,
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
      `should send an email for ${capitatedInitial} with ${Authority["1915c"]}`,
      Authority["1915c"],
      capitatedInitial,
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
describe("process emails  Handler failures", () => {
  it.each([
    [
      `should send an email for ${withdrawRai} with ${Authority["1915b"]} and fail due to not finding it`,
      Authority["1915b"],
      withdrawRai,
      SIMPLE_ID,
    ],
    [
      `should send an email for ${withdrawRai} with ${Authority["1915c"]} and fail due to not finding it`,
      Authority["1915c"],
      withdrawRai,
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
