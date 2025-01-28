import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./submitSplitSPA";
import { APIGatewayEvent } from "node_modules/shared-types";
import { TEST_CHIP_SPA_ITEM, TEST_MED_SPA_ITEM } from "mocks";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn((data) => data),
}));

vi.mock("./getNextSplitSPAId", () => ({
  getNextSplitSPAId: vi.fn(),
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

  // it("should return 400 if package ID is not provided", async () => {
  //   const emptyBody = {
  //     body: JSON.stringify({ packageId: undefined }),
  //   } as APIGatewayEvent;
  //   const result = await handler(emptyBody);
  //   expect(result?.statusCode).toEqual(400);
  // });

  it("should return 404 if package ID is not found", async () => {
    const invalidPackage = {
      body: { packageId: "MD-25-9999" },
    } as unknown as APIGatewayEvent;
    const result = await handler(invalidPackage);
    expect(result?.statusCode).toEqual(404);
  });

  it("should throw an error if not Medicaid SPA", async () => {
    const chipSPAPackage = {
      body: { packageId: TEST_CHIP_SPA_ITEM._id },
    } as unknown as APIGatewayEvent;
    const result = await handler(chipSPAPackage);
    const expectedResult = {
      statusCode: 400,
      body: { message: "Record must be a Medicaid SPA" },
    };
    expect(result).toEqual(expectedResult);
  });

  it("should return 400 if package ID not provided", async () => {
    const invalidPackage = {
      body: JSON.stringify({}),
    } as unknown as APIGatewayEvent;
    const result = await handler(invalidPackage);
    expect(result?.statusCode).toEqual(400);
  });

  it("should fail to split a package with no topic name", async () => {
    process.env.topicName = "";
    const noActionevent = {
      body: {
        packageId: TEST_MED_SPA_ITEM._id,
      },
    } as unknown as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  // it("should create a split SPA", async () => {
  //   const medSPAPackage = {
  //     body: { packageId: TEST_MED_SPA_ITEM._id },
  //   } as unknown as APIGatewayEvent;
  //   console.log(medSPAPackage, "HELLO??");
  //   const result = await handler(medSPAPackage);
  //   expect(result?.body).toEqual('{"message":"Record must be a Medicaid SPA"}');
  // });
});
