import { it, describe, expect, afterEach, vi } from "vitest";
import { CloudWatch } from "@aws-sdk/client-cloudwatch";
import { handler } from "../handlers/templatizeCloudWatchDashboard";

vi.mock("@aws-sdk/client-cloudwatch", () => ({
  CloudWatch: vi.fn(() => ({
    getDashboard: vi.fn(() => ({
      DashboardBody: "mocked dashboard body",
    })),
  })),
}));

describe("templatize cloudwatch dashboard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return successful metric response", async () => {
    const expectedTemplateJson = "mocked dashboard body";
    process.env.region = "us-east-1";
    process.env.stage = "test-stage";
    process.env.accountId = "ac-test-0123";
    process.env.service = "test-service";

    expectedTemplateJson
      .replaceAll("ac-test-0123", "${aws:accountId}")
      .replaceAll("test-stage", "${sls:stage}")
      .replaceAll("us-east-1", "${env:REGION_A}")
      .replaceAll("test-service", "${self:service}");

    const result = await handler();

    expect(CloudWatch).toHaveBeenCalledWith({});

    expect(result).toEqual(expectedTemplateJson);
  });
});
