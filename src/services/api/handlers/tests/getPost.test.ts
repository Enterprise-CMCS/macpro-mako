import { it, describe, expect, vi, afterAll } from "vitest";
import { getPost } from "../getPost";

vi.mock("../../libs/handler", () => {
  return {
    handler: vi.fn(),
  };
});

describe("getPost", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });
  it("should return 400 Bad Request if id is missing", async () => {
    const event = { pathParameters: {} };
    const result = await getPost(event);
    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body)).toEqual({ message: "Invalid request" });
  });

  it("should return 200 OK with the post id", async () => {
    const event = { pathParameters: { id: "123" } };
    const result = await getPost(event);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual({ id: "123" });
  });
});
