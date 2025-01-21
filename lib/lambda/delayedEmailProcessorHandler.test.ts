import { describe, it, expect } from "vitest";
import { SQSEvent } from "aws-lambda";
import { handler } from "./delayedEmailProcessor";
import { KafkaRecord } from "shared-types";
import { Authority } from "shared-types";
import { SIMPLE_ID, WITHDRAW_RAI_ITEM_B, WITHDRAW_RAI_ITEM_C } from "mocks";
import { uploadSubsequentDocuments } from "lib/libs/email/content";
const nms = "new-medicaid-submission";
const ncs = "new-chip-submission";
const tempExtension = "temporary-extension";
const withdrawPackage = "withdraw-package";
const contractingInitial = "contracting-initial";
const capitatedInitial = "capitated-initial";
const withdrawRai = "withdraw-rai";
const respondToRai = "respond-to-rai";
const appk = "app-k";

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
  [`should send an email for ${nms} with ${Authority.MED_SPA}`, Authority.MED_SPA, nms, SIMPLE_ID],
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
  [`should send an email for ${ncs} with ${Authority.MED_SPA}`, Authority.MED_SPA, ncs, SIMPLE_ID],
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
  const mockEvent: SQSEvent = {
    Records: [
      {
        messageId: "test-message-id",
        receiptHandle: "test-receipt-handle",
        body: JSON.stringify({
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
        }),
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: "1732645041557",
          SenderId: "test-sender",
          ApproximateFirstReceiveTimestamp: "1732645041557",
        },
        messageAttributes: {},
        md5OfBody: "test-md5",
        eventSource: "aws:sqs",
        eventSourceARN: "test:arn",
        awsRegion: "us-east-1",
      },
    ],
  };
  await handler(mockEvent);
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
    const mockEvent: SQSEvent = {
      Records: [
        {
          messageId: "test-message-id",
          receiptHandle: "test-receipt-handle",
          body: JSON.stringify({
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
          } as unknown as KafkaRecord),
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "1732645041557",
            SenderId: "test-sender",
            ApproximateFirstReceiveTimestamp: "1732645041557",
          },
          messageAttributes: {},
          md5OfBody: "test-md5",
          eventSource: "aws:sqs",
          eventSourceARN: "test:arn",
          awsRegion: "us-east-1",
        },
      ],
    };
    await expect(() => handler(mockEvent)).rejects.toThrow();
  });
});
