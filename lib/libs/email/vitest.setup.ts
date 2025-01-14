import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { REGION, setDefaultStateSubmitter } from "mocks";

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
