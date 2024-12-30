import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getCpocs";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("libs/opensearch-lib", () => ({
  search: vi.fn(),
}));

describe("getCpocs Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain"; // Set the environment variable before each test
    process.env.indexNamespace = "test-namespace-"; // Set the environment variable before each test
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 400 if no Cpocs are found", async () => {
    (os.search as vi.Mock).mockResolvedValueOnce(null);

    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "No Cpocs found" },
    });
  });

  it("should return 200 with the result if Cpocs are found", async () => {
    const mockResult = { hits: { hits: [{ _source: { name: "test-cpoc" } }] } };
    (os.search as vi.Mock).mockResolvedValueOnce(mockResult);

    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: mockResult,
    });
  });

  it("should return 500 if an error occurs during processing", async () => {
    (os.search as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = { body: JSON.stringify({}) } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
