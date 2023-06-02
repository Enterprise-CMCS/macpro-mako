import { it, describe, expect, vi, afterAll } from "vitest";
import type { APIGatewayEvent } from "aws-lambda";
import { createIssue } from "../createIssue";

const mockEvent: APIGatewayEvent = {} as APIGatewayEvent;

describe("creatIssue", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("returns a 201 status code and an empty issue object", async () => {
    const response = await createIssue(mockEvent);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(JSON.stringify({ issue: {} }));
  });
});
