import {
  getRequestContext,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
  TEST_SPA_ITEM_FROM_SEATOOL,
} from "mocks";
import { APIGatewayEvent } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./submitSplitSPA";

vi.mock("libs/api/kafka", () => ({
  produceMessage: vi.fn(() => Promise.resolve([{ partition: 0, offset: "1" }])),
}));

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
      body: JSON.stringify({ id: "MD-25-9999", newPackageIdSuffix: "A" }),
    } as unknown as APIGatewayEvent;

    const result = await handler(invalidPackage);

    expect(result?.statusCode).toEqual(404);
  });

  it("should throw an error if not Medicaid SPA", async () => {
    const chipSPAPackage = {
      body: JSON.stringify({ id: TEST_CHIP_SPA_ITEM._id, newPackageIdSuffix: "A" }),
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
        id: TEST_MED_SPA_ITEM._id,
        newPackageIdSuffix: "A",
      }),
    } as APIGatewayEvent;

    await expect(handler(noActionevent)).rejects.toThrow("Topic name is not defined");
  });

  it("should create a split SPA", async () => {
    const medSPAPackage = {
      body: JSON.stringify({ id: TEST_MED_SPA_ITEM._id, newPackageIdSuffix: "A" }),
    } as unknown as APIGatewayEvent;

    const result = await handler(medSPAPackage);
    expect(result?.statusCode).toEqual(200);
  });

  it("should create a NOSO if package exists in SEAtool", async () => {
    const medSPAPackage = {
      body: JSON.stringify({
        id: TEST_SPA_ITEM_FROM_SEATOOL._id,
        newPackageIdSuffix: "A",
        changeMade: "Test change reason",
        changeReason: "This is a test",
        status: "Submitted",
        submitterEmail: "[george@example.com](mailto:george@example.com)",
        submitterName: "George Harrison",
        submissionDate: "06/26/2025 11:00:00 AM",
        proposedDate: "06/26/2025",
      }),
    } as unknown as APIGatewayEvent;

    const result = await handler(medSPAPackage);
    expect(result?.statusCode).toEqual(200);
  });
});
