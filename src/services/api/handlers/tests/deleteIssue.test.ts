import { it, describe, expect, vi, afterAll } from "vitest";
import { deleteIssue } from "../deleteIssue";

describe("deleteIssue", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("returns 400 if pathParameters is undefined", async () => {
    const event = { pathParameters: null };
    const response = await deleteIssue(event);
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Invalid request" });
  });

  it("returns 400 if pathParameters.id is undefined", async () => {
    const event = { pathParameters: {} };
    const response = await deleteIssue(event);
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Invalid request" });
  });

  it("returns 200 with correct message if pathParameters.id is defined", async () => {
    const id = "123";
    const event = { pathParameters: { id } };
    const response = await deleteIssue(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      issue: `Issue with ${id} was deleted`,
    });
  });
});
