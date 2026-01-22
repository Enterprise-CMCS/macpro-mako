import { ConfigResourceTypes } from "kafkajs";
import {
  API_ENDPOINT,
  ATTACHMENT_BUCKET_NAME,
  ATTACHMENT_BUCKET_REGION,
  BUCKET_NAME,
  BUCKET_REGION,
  IDENTITY_POOL_ID,
  KAFKA_BROKERS,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  PROJECT,
  REGION,
  setDefaultStateSubmitter,
  STAGE,
  USER_POOL_CLIENT_DOMAIN,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "mocks";
import { mockedKafka } from "mocks/helpers/kafka.utils";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
type CreateType<T> = T & { default: T };

vi.mock("kafkajs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("kafkajs")>()),
  ConfigResourceTypes: await importOriginal<CreateType<typeof ConfigResourceTypes>>(),
  Kafka: mockedKafka,
}));

beforeAll(() => {
  setDefaultStateSubmitter();

  console.log("starting MSW listener for lib tests");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

beforeEach(() => {
  process.env.PROJECT = PROJECT;
  process.env.REGION_A = REGION;
  process.env.STAGE = STAGE;
  process.env.isDev = "false";

  process.env.project = PROJECT;
  process.env.region = REGION;
  process.env.stage = STAGE;

  process.env.applicationEndpointUrl = API_ENDPOINT;
  process.env.identityPoolId = IDENTITY_POOL_ID;
  process.env.userPoolId = USER_POOL_ID;
  process.env.idmClientId = USER_POOL_CLIENT_ID;
  process.env.idmClientIssuer = USER_POOL_CLIENT_DOMAIN;
  process.env.osDomain = OPENSEARCH_DOMAIN;
  process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
  process.env.bucket = BUCKET_NAME;
  process.env.bucketRegion = BUCKET_REGION;
  process.env.attachmentsBucketName = ATTACHMENT_BUCKET_NAME;
  process.env.attachmentsBucketRegion = ATTACHMENT_BUCKET_REGION;
  process.env.emailAddressLookupSecretName = "mock-email-secret"; // pragma: allowlist secret
  process.env.DLQ_URL = "https://sqs.us-east-1.amazonaws.com/123/test";
  process.env.configurationSetName = "SES";
  process.env.brokerString = KAFKA_BROKERS;
  process.env.idmAuthzApiKeyArn = "test-secret"; // pragma: allowlist secret
  process.env.idmAuthzApiEndpoint = "https://dimAuthzEndpoint.com";

  // DataSink environment variables
  process.env.idempotencyTableName = "test-idempotency-table";
  process.env.smartTopicName = "test-smart-topic";
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.resetAllMocks();

  mockedServer.close();
});
