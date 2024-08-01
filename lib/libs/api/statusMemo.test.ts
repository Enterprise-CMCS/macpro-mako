import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { buildStatusMemoQuery } from "./statusMemo"; // replace with the actual path to your module

describe("buildStatusMemoQuery", () => {
  const mockDate = new Date("2023-01-01T12:00:00Z").getTime();

  beforeAll(() => {
    vi.setSystemTime(mockDate);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return the correct query for update operation", () => {
    const result = buildStatusMemoQuery("someId", "Test message", "update");
    const expectedDate = new Date(mockDate).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const expectedQuery = `'- OneMAC Activity: ${expectedDate} - Test message \r' + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))`;
    expect(result).toBe(expectedQuery);
  });

  it("should return the correct query for insert operation", () => {
    const result = buildStatusMemoQuery("someId", "Test message", "insert");
    const expectedDate = new Date(mockDate).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const expectedQuery = `'- OneMAC Activity: ${expectedDate} - Test message \r'`;
    expect(result).toBe(expectedQuery);
  });

  it("should default to update operation when no operation is provided", () => {
    const result = buildStatusMemoQuery("someId", "Test message");
    const expectedDate = new Date(mockDate).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const expectedQuery = `'- OneMAC Activity: ${expectedDate} - Test message \r' + CAST(ISNULL(Status_Memo, '') AS VARCHAR(MAX))`;
    expect(result).toBe(expectedQuery);
  });
});
