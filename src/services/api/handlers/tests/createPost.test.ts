import { it, describe, expect, vi, afterAll } from "vitest";
import type { APIGatewayEvent } from "aws-lambda";
import { createPost } from "../createPost";

const mockEvent: APIGatewayEvent = {} as APIGatewayEvent;

describe("creatPost", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("returns a 201 status code and an empty post object", async () => {
    const response = await createPost(mockEvent);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(JSON.stringify({ post: {} }));
  });
});
