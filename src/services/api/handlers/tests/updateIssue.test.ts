import { it, describe, expect, vi, afterAll } from "vitest";
import { updateIssue } from "../updateIssue";

describe("updateIssue", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should return 400 status code and error message when request body is missing or empty", async () => {
    const event = { pathParameters: { id: "123" }, body: "" };
    const response = await updateIssue(event);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({ message: "Invalid request" })
    );
  });

  it("should return 200 status code and success message when issue is updated", async () => {
    const event = {
      pathParameters: { id: "123" },
      body: '{"title": "Updated Title", "content": "Updated Content"}',
    };
    const response = await updateIssue(event);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({ message: "Issue with 123 was updated" })
    );
  });
});
