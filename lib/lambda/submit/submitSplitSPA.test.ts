import {
  getRequestContext,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
  TEST_SPA_ITEM_TO_SPLIT,
} from "mocks";
import { APIGatewayEvent } from "node_modules/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./submitSplitSPA";

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

  it("should return 404 if package ID is not found", async () => {
    const invalidPackage = {
      body: JSON.stringify({ packageId: "MD-25-9999" }),
    } as unknown as APIGatewayEvent;

    const result = await handler(invalidPackage);

    expect(result?.statusCode).toEqual(404);
  });

  it("should throw an error if not Medicaid SPA", async () => {
    const chipSPAPackage = {
      body: JSON.stringify({ packageId: TEST_CHIP_SPA_ITEM._id }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const result = await handler(chipSPAPackage);

    expect(result.body).toEqual(JSON.stringify({ message: "Record must be a Medicaid SPA" }));
  });

  it("should return 400 if package ID not provided", async () => {
    const invalidPackage = {
      body: JSON.stringify({}),
    } as unknown as APIGatewayEvent;

    const result = await handler(invalidPackage);

    expect(result?.statusCode).toEqual(400);
  });

  it("should fail to split a package with no topic name", async () => {
    delete process.env.topicName;

    const noActionevent = {
      body: JSON.stringify({
        packageId: TEST_MED_SPA_ITEM._id,
      }),
    } as APIGatewayEvent;

    await expect(handler(noActionevent)).rejects.toThrow("Topic name is not defined");
  });

  it("should create a split SPA", async () => {
    const medSPAPackage = {
      body: JSON.stringify({ packageId: TEST_MED_SPA_ITEM._id }),
    } as unknown as APIGatewayEvent;

    const result = await handler(medSPAPackage);
    expect(result?.statusCode).toEqual(200);
  });

  it("should fail if unable to get next split SPA suffix", async () => {
    const medSPAPackage = {
      body: JSON.stringify({ packageId: TEST_SPA_ITEM_TO_SPLIT }),
    } as unknown as APIGatewayEvent;

    await expect(handler(medSPAPackage)).rejects.toThrow("This package can't be further split.");
  });
});
