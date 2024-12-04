import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./deleteIndex";
import * as os from "libs/opensearch-lib";
import { Context } from 'aws-lambda';

vi.mock("libs/opensearch-lib", () => ({
  deleteIndex: vi.fn(),
}));

const mockedDeleteIndex = vi.mocked(os.deleteIndex);
mockedDeleteIndex.mockResolvedValue(undefined);

// Mock AWS Lambda Context
const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: "test",
  functionVersion: "1",
  invokedFunctionArn: "arn:test",
  memoryLimitInMB: "128",
  awsRequestId: "test-id",
  logGroupName: "test-group",
  logStreamName: "test-stream",
  getRemainingTimeInMillis: () => 1000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

describe("Lambda Handler", () => {
  const callback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete all indices", async () => {
    const event = {
      osDomain: "test-domain",
      indexNamespace: "test-namespace-",
    };

    mockedDeleteIndex.mockResolvedValueOnce(undefined);

    await handler(event, mockContext, callback);

    const expectedIndices = [
      "test-namespace-main",
      "test-namespace-changelog",
      "test-namespace-insights",
      "test-namespace-types",
      "test-namespace-subtypes",
      "test-namespace-legacyinsights",
      "test-namespace-cpocs",
    ];

    expectedIndices.forEach((index) => {
      expect(os.deleteIndex).toHaveBeenCalledWith("test-domain", index);
    });

    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should handle missing osDomain", async () => {
    const event = {
      indexNamespace: "test-namespace-",
    };

    await handler(event, mockContext, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(String), {
      statusCode: 500,
    });
  });

  it("should handle errors during index deletion", async () => {
    const event = {
      osDomain: "test-domain",
      indexNamespace: "test-namespace-",
    };

    mockedDeleteIndex.mockRejectedValueOnce(new Error("Test error"));

    await handler(event, mockContext, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error), {
      statusCode: 500,
    });
  });
});
