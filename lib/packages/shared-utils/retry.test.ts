import { it, describe, expect, vi } from "vitest";
import { retry } from "./retry";

describe("test retry function", () => {
  it("fails when retry limit is reached", async () => {
    const badFunction = vi.fn(() => {
      throw new Error("failed");
    });

    await expect(retry(() => badFunction(), 5, 1)).rejects.toThrow("failed");
    expect(badFunction).toHaveBeenCalledTimes(5);
  });

  it("passes first time", async () => {
    const goodFunction = vi.fn(async () => {
      return true;
    });

    await retry(() => goodFunction(), 5, 1);
    expect(goodFunction).toHaveBeenCalledTimes(1);
  });

  it("passes after a few retries", async () => {
    const badFunction = vi.fn().mockRejectedValueOnce("failed").mockResolvedValueOnce("worked");

    await retry(() => badFunction(), 5, 1);
    expect(badFunction).toHaveBeenCalledTimes(2);
    expect(badFunction).toHaveLastResolvedWith("worked");
  });
});
