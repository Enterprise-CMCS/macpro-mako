import { it, describe, expect, vi, afterAll } from "vitest";
import { getIssues } from "../getIssues";

describe("getIssues", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should return 200 OK with the issues", async () => {
    const result = await getIssues();
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });
});
