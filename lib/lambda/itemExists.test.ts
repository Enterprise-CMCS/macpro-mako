import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as os from "../libs/opensearch-lib";
import { handler } from "./itemExists";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("../libs/opensearch-lib", () => ({
  getItem: vi.fn(),
}));

describe("Handler for checking if record exists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain";
    process.env.indexNamespace = "test-namespace-";
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 200 and exists: true if record is found", async () => {
    (os.getItem as vi.Mock).mockResolvedValueOnce({ _source: {} });

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: { message: "Record found for the given id", exists: true },
    });
  });

  it("should return 200 and exists: false if no record is found", async () => {
    (os.getItem as vi.Mock).mockResolvedValueOnce({});

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: { message: "No record found for the given id", exists: false },
    });
  });

  it.skip("should return 500 if an error occurs during processing", async () => {
    (os.getItem as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
