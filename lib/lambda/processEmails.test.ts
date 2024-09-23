import {
  createEmailParams,
  handler as processEmailsHandler,
  processRecord,
  sendEmail,
} from "./processEmails";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getAllStateUsers } from "./../libs/email";
import { getSecret } from "shared-utils";
import * as os from "../libs/opensearch-lib";
import { Context } from "aws-lambda";
import { vi, Mock } from "vitest";

vi.mock("@aws-sdk/client-ses");

describe("createEmailParams", () => {
  const emailDetails = {
    to: ["recipient@example.com"],
    from: "sender@example.com",
    subject: "Test Email",
    html: "<html>Test</html>",
    text: "Test",
  };

  it("should create email parameters correctly", () => {
    const params = createEmailParams(emailDetails, emailDetails.from);
    expect(params).toEqual({
      Destination: {
        ToAddresses: emailDetails.to,
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailDetails.html,
          },
          Text: {
            Charset: "UTF-8",
            Data: emailDetails.text,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: emailDetails.subject,
        },
      },
      Source: emailDetails.from,
    });
  });
});

describe("sendEmail", () => {
  const mockSesClient = new SESClient();
  const emailDetails = {
    to: ["recipient@example.com"],
    from: "sender@example.com",
    subject: "Test Email",
    html: "<html>Test</html>",
    text: "Test",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send email successfully", async () => {
    (mockSesClient.send as Mock).mockResolvedValue({});
    const params = createEmailParams(emailDetails, emailDetails.from);

    await sendEmail(params);
    expect(mockSesClient.send).toHaveBeenCalledWith(
      expect.any(SendEmailCommand),
    );
  });

  it("should throw an error when there is an issue sending an email", async () => {
    (mockSesClient.send as Mock).mockRejectedValue(
      new Error("Error sending email"),
    );
    const params = createEmailParams(emailDetails, emailDetails.from);

    await expect(sendEmail(params)).rejects.toThrow("Error sending email");
  });
});

describe("processEmails", () => {
  vi.mock("@aws-sdk/client-ses");
  vi.mock("./../libs/email");
  vi.mock("shared-utils");
  vi.mock("../libs/opensearch-lib");
  const mockKafkaEvent: KafkaEvent = {
    eventSource: "aws:kafka",
    bootstrapServers:
      "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
    records: {
      "topic-partition": [
        {
          key: "key",
          value: "value",
          timestamp: 1234567890,
          topic: "topic",
          partition: 0,
          offset: 0,
          timestampType: "CREATE_TIME",
          headers: {},
        },
      ],
    },
  };

  const mockContext = {} as Context; // Create a mock Context object
  const mockThirdArgument = () => {}; // Add the appropriate third argument here

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process Kafka event successfully", async () => {
    (getAllStateUsers as Mock).mockResolvedValue([]);
    (getSecret as Mock).mockResolvedValue("{}");
    (os.getItem as Mock).mockResolvedValue({});

    await processEmailsHandler(mockKafkaEvent, mockContext, mockThirdArgument);
    expect(getAllStateUsers).toHaveBeenCalled();
    expect(getSecret).toHaveBeenCalled();
    expect(os.getItem).toHaveBeenCalled();
  });

  it("should handle tombstone event", async () => {
    const tombstoneRecord: KafkaRecord = {
      key: "base64-encoded-key",
      value: "",
      topic: "example-topic",
      partition: 0,
      offset: 0,
      timestamp: Date.now(),
      timestampType: "CREATE_TIME",
      headers: {},
    };

    await processRecord(tombstoneRecord, "secret-name", "endpoint-url");
    expect(getAllStateUsers).not.toHaveBeenCalled();
  });

  it("should throw an error when there is an issue processing email event", async () => {
    (getAllStateUsers as Mock).mockRejectedValue(
      new Error("Error fetching users"),
    );

    await expect(
      processEmailsHandler(mockKafkaEvent, mockContext, mockThirdArgument),
    ).rejects.toThrow("Error fetching users");
  });
});
