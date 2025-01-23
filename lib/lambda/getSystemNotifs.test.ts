import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSystemNotifs } from "./getSystemNotifs";
import * as util from "shared-utils";

vi.mock("shared-utils", () => ({
  getExport: vi.fn(),
  getSecret: vi.fn(),
}));

describe("notif handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 200 and notifs if secret exists", async () => {
    vi.stubEnv("notificationSecretArn", "test_secret");
    vi.spyOn(util, "getSecret").mockImplementation(async () => "[]");
    const result = await getSystemNotifs();
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe("[]");
  });

  it("returns 200 and empty array if no notifs", async () => {
    vi.stubEnv("notificationSecretArn", "test_secret");
    vi.spyOn(util, "getSecret").mockImplementation(async () => null as unknown as string);
    const result = await getSystemNotifs();
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe("[]");
  });

  it("returns 502 with specific error", async () => {
    vi.stubEnv("notificationSecretArn", "error");
    vi.spyOn(util, "getSecret").mockImplementation(async () => {
      throw new Error("test error");
    });
    const result = await getSystemNotifs();
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toBe("test error");
  });

  it("returns 502 with generic error", async () => {
    vi.stubEnv("notificationSecretArn", undefined);
    vi.spyOn(util, "getSecret").mockImplementation(async () => {
      throw new Error();
    });
    const result = await getSystemNotifs();
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toBe("Internal server error");
  });
});
