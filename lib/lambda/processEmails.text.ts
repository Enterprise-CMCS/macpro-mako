import {
  createEmailParams,
  handler as processEmailsHandler,
  processRecord,
  sendEmail,
} from "./processEmails";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getAllStateUsers } from "libs/email";
import { getSecret } from "shared-utils";
import * as os from "libs/opensearch-lib";
import { Context } from "aws-lambda";
import {
  vi,
  Mock,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
} from "vitest";
import { EmailAddresses } from "shared-types";

// Add this near the top of your test file, after the imports
const mockEmailAddresses: EmailAddresses = {
  osgEmail: ["osg@example.com"],
  dpoEmail: ["dpo@example.com"],
  dmcoEmail: ["dmco@example.com"],
  dhcbsooEmail: ["dhcbsoo@example.com"],
  chipInbox: ["chip.inbox@example.com"],
  chipCcList: ["chip.cc1@example.com", "chip.cc2@example.com"],
  sourceEmail: "source@example.com",
  srtEmails: ["srt1@example.com", "srt2@example.com"],
  cpocEmail: ["cpoc@example.com"],
};

vi.mock("@aws-sdk/client-ses");
beforeAll(() => {
  vi.clearAllMocks();

  // Mock environment variables
  vi.stubEnv("region", "us-east-1");
  vi.stubEnv("stage", "test");
  vi.stubEnv("indexNamespace", "test-index");
  vi.stubEnv("osDomain", "https://mock-opensearch-domain.com");
  vi.stubEnv("applicationEndpointUrl", "https://mock-app-endpoint.com");
  vi.stubEnv("emailAddressLookupSecretName", "mock-email-secret");
  vi.stubEnv("EMAIL_ATTEMPTS_TABLE", "mock-email-attempts-table");
  vi.stubEnv("MAX_RETRY_ATTEMPTS", "3");
  vi.stubEnv("userPoolId", "mock-user-pool-id");

  // Mock the getSecret function
  (getSecret as Mock).mockResolvedValue(JSON.stringify(mockEmailAddresses));

  // Add any other mocks or setup needed for your tests
});
afterAll(() => {
  // Clear stubbed environment variables after each test
  vi.unstubAllEnvs();
});
describe("createEmailParams", () => {
  const emailDetails = {
    to: ["recipient@example.com"],
    from: "sender@example.com",
    subject: "Test Email",
    html: "<html>Test</html>",
    text: "Test",
  };
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv("region", "us-east-1");
    vi.stubEnv("emailAddressLookupSecretName", "mock-email-secret");
    vi.stubEnv("applicationEndpointUrl", "https://mock-app-endpoint.com");
    vi.stubEnv(
      "openSearchDomainEndpoint",
      "https://mock-opensearch-domain.com",
    );
    // Mock environment variables
    vi.stubEnv("indexNamespace", "https://mock-opensearch-endpoint.com");
    (getSecret as Mock).mockResolvedValue(JSON.stringify(mockEmailAddresses));

    // Add any other environment variables your code expects
  });

  afterEach(() => {
    // Clear stubbed environment variables after each test
    vi.unstubAllEnvs();
  });

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

    // Mock environment variables
    vi.stubEnv("OPENSEARCH_ENDPOINT", "https://mock-opensearch-endpoint.com");
    vi.stubEnv("INDEX_NAMESPACE", "mock-index-namespace");
    (getSecret as Mock).mockResolvedValue(JSON.stringify(mockEmailAddresses));

    // Add any other environment variables your code expects
  });

  afterEach(() => {
    // Clear stubbed environment variables after each test
    vi.unstubAllEnvs();
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
    ).rejects.toThrow();
  });
});
