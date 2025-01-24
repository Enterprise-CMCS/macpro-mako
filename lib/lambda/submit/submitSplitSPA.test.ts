import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./submitSplitSPA";
import { APIGatewayEvent } from "node_modules/shared-types";
import { TEST_CHIP_SPA_ITEM } from "mocks";

describe("handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;
    const result = await handler(event);
    expect(result?.statusCode).toEqual(400);
  });

  it("should return 400 if package ID is not provided", async () => {
    const emptyBody = { body: { packageId: undefined } } as unknown as APIGatewayEvent;
    const result = await handler(emptyBody);
    expect(result?.statusCode).toEqual(400);
  });

  it("should return 404 if package ID is not found", async () => {
    const invalidPackage = {
      body: { packageId: "MD-25-9999" },
    } as unknown as APIGatewayEvent;
    const result = await handler(invalidPackage);
    expect(result?.statusCode).toEqual(404);
    expect(result?.body).toEqual('{"message":"No record found for the given id"}');
  });

  it("should throw an error if not Medicaid SPA", async () => {
    const chipSPAPackage = {
      body: { packageId: TEST_CHIP_SPA_ITEM._id },
    } as unknown as APIGatewayEvent;
    const result = await handler(chipSPAPackage);
    expect(result?.body).toEqual('{"message":"Record must be a Medicaid SPA"}');
  });
});
