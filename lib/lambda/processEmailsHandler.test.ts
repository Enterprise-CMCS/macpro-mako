import { describe, it, expect, vi } from "vitest";
import { Context } from "aws-lambda";
import { SESClient } from "@aws-sdk/client-ses";
import { handler } from "./processEmails";
import { KafkaRecord, KafkaEvent } from "shared-types";
import { Authority } from "shared-types";

const nms = "new-medicaid-submission";
const ncs = "new-chip-submission";
const tempExtension = "temp-extension";
const withdrawPackage = "withdraw-package";
const contractingInitial = "contracting-initial";
const capitatedInitial = "capitated-initial";

describe("process emails  Handler", () => {
  it.each([
    [`should send an email for ${nms} with ${Authority.MED_SPA}`, Authority.MED_SPA, nms],
    [`should send an email for ${nms} with ${Authority.CHIP_SPA}`, Authority.CHIP_SPA, nms],
    [`should send an email for ${nms} with ${Authority["1915b"]}`, Authority["1915b"], nms],
    [`should send an email for ${nms} with ${Authority["1915c"]}`, Authority["1915c"], nms],
    [`should send an email for ${ncs} with ${Authority.MED_SPA}`, Authority.MED_SPA, ncs],
    [`should send an email for ${ncs} with ${Authority.CHIP_SPA}`, Authority.CHIP_SPA, ncs],
    [`should send an email for ${ncs} with ${Authority["1915b"]}`, Authority["1915b"], ncs],
    [`should send an email for ${ncs} with ${Authority["1915c"]}`, Authority["1915c"], ncs],
    [
      `should send an email for ${tempExtension} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      tempExtension,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      tempExtension,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915b"]}`,
      Authority["1915b"],
      tempExtension,
    ],
    [
      `should send an email for ${tempExtension} with ${Authority["1915c"]}`,
      Authority["1915c"],
      tempExtension,
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      withdrawPackage,
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      withdrawPackage,
    ],
    [
      `should send an email for ${withdrawPackage} for ${ncs} with ${Authority["1915b"]}`,
      Authority["1915b"],
      withdrawPackage,
    ],
    [
      `should send an email for ${withdrawPackage} with ${Authority["1915c"]}`,
      Authority["1915c"],
      withdrawPackage,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      contractingInitial,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      contractingInitial,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915b"]}`,
      Authority["1915b"],
      contractingInitial,
    ],
    [
      `should send an email for ${contractingInitial} with ${Authority["1915c"]}`,
      Authority["1915c"],
      contractingInitial,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority.MED_SPA}`,
      Authority.MED_SPA,
      capitatedInitial,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority.CHIP_SPA}`,
      Authority.CHIP_SPA,
      capitatedInitial,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority["1915b"]}`,
      Authority["1915b"],
      capitatedInitial,
    ],
    [
      `should send an email for ${capitatedInitial} with ${Authority["1915c"]}`,
      Authority["1915c"],
      capitatedInitial,
    ],
  ])("%s", async (_, auth, eventType) => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
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
