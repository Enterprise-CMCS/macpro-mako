import { it, describe, expect, vi, afterAll } from "vitest";
import { getIssue } from "../getIssue";

describe("getIssue", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });
  it("should return 400 Bad Request if id is missing", async () => {
    const event = { pathParameters: {} };
    const result = await getIssue(event);
    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body)).toEqual({ message: "Invalid request" });
  });

  it("should return 200 OK with the issue id", async () => {
    const event = { pathParameters: { id: "123" } };
    const result = await getIssue(event);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual({
      issue: {
        id: "123",
        title: "My first issue",
      },
    });
  });
});
