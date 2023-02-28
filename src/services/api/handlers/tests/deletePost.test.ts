import { it, describe, expect, vi, afterAll } from "vitest";
import { deletePost } from "../deletePost";

vi.mock("../../libs/handler", () => {
  return {
    handler: vi.fn(),
  };
});

describe("deletePost", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  it("returns 400 if pathParameters is undefined", async () => {
    const event = { pathParameters: null };
    const response = await deletePost(event);
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Invalid request" });
  });

  it("returns 400 if pathParameters.id is undefined", async () => {
    const event = { pathParameters: {} };
    const response = await deletePost(event);
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Invalid request" });
  });

  it("returns 200 with correct message if pathParameters.id is defined", async () => {
    const id = "123";
    const event = { pathParameters: { id } };
    const response = await deletePost(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual({
      post: `Post with ${id} was deleted`,
    });
  });
});
