import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  REGION,
  setDefaultStateSubmitter,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {
  setDefaultStateSubmitter();

  console.log("starting MSW listener for email tests");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

beforeEach(() => {
  process.env.REGION_A = REGION;
  process.env.region = REGION;
  process.env.isDev = "true";
  process.env.osDomain = OPENSEARCH_DOMAIN;
  process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;

  vi.useFakeTimers();
  const now = new Date(2023, 0, 1);
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.clearAllMocks();

  mockedServer.close();
});
