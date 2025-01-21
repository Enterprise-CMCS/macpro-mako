import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./updatePackage";
import { APIGatewayEvent } from "node_modules/shared-types";

import {
  EXISTING_ITEM_ID,
  EXISTING_ITEM_PENDING_ID,
  CAPITATED_INITIAL_ITEM_ID,
  CAPITATED_INITIAL_NEW_ITEM_ID,
  SIMPLE_ID,
} from "mocks";
vi.mock("libs/handler-lib", () => ({
  response: vi.fn((data) => data),
}));

describe("handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;
    const result = await handler(event);
    const expectedResult = { statusCode: 400, body: { message: "Event body required" } };

    expect(result).toStrictEqual(expectedResult);
  });

  it("should return 400 if package ID is not found", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultPackage = await handler(noActionevent);

    expect(resultPackage.statusCode).toBe(400);
  });
  it("should return 400 if action is not found", async () => {
    const noApackageEvent = {
      body: JSON.stringify({ action: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultAction = await handler(noApackageEvent);

    expect(resultAction.statusCode).toBe(400);
  });
  it("should get a package", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", action: "delete", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 404,
      body: { message: "No record found for the given id" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should delete a package", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "delete",
        changeReason: "Nunya",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 200,
      body: { message: "MD-00-0000 has been deleted." },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should delete a package but no topic name", async () => {
    process.env.topicName = "";
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "delete",
        changeReason: "Nunya",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should fail to update an ID on a package - missing new iD", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 400,
      body: { message: "New ID required to update package" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update an ID on a package - missing or same ID", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 400,
      body: { message: "New ID required to update package" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update an ID on a package - missing or same ID", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
        updatedId: EXISTING_ITEM_PENDING_ID,
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 400,
      body: { message: "This ID already exists" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should update an ID on a package", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: CAPITATED_INITIAL_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
        updatedId: CAPITATED_INITIAL_NEW_ITEM_ID,
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 200,
      body: {
        message: `The ID of package ${CAPITATED_INITIAL_ITEM_ID} has been updated to ${CAPITATED_INITIAL_NEW_ITEM_ID}.`,
      },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update a package ID with no topic name", async () => {
    process.env.topicName = "";
    const noActionevent = {
      body: JSON.stringify({
        packageId: CAPITATED_INITIAL_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
        updatedId: "SS-1235.R00.00",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should fail to update a package ID with bad new id format", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: CAPITATED_INITIAL_ITEM_ID,
        action: "update-id",
        changeReason: "Nunya",
        updatedId: "SS-120",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult =
      "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00";

    expect(JSON.parse(result?.body)[0].message).toStrictEqual(expectedResult);
  });
  it("should fail to update a package with bad existing id format", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: SIMPLE_ID,
        action: "update-id",
        changeReason: "Nunya",
        updatedId: "SS-120",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    expect(result?.statusCode).toStrictEqual(500);
    expect(result?.body).toStrictEqual({
      message: "Cannot read properties of undefined (reading 'baseSchema')",
    });
  });

  it("should fail to update a package - no topic name ", async () => {
    process.env.topicName = "";
    const noActionevent = {
      body: JSON.stringify({
        packageId: SIMPLE_ID,
        action: "update-values",
        changeReason: "Nunya",
        updatedFields: {},
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update a package - No valid fields ", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: SIMPLE_ID,
        action: "update-values",
        changeReason: "Nunya",
        updatedFields: { badfield: "nothing" },
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 400,
      body: { message: "Cannot update invalid field(s): badfield" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update a package - Id can not be updated ", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: SIMPLE_ID,
        action: "update-values",
        changeReason: "Nunya",
        updatedFields: { id: "cant update ID here" },
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 400,
      body: { message: "ID is not a valid field to update" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should fail to update a package - nothing to update ", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: CAPITATED_INITIAL_ITEM_ID,
        action: "update-values",
        changeReason: "Nunya",
        updatedFields: { state: "TX" },
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);
    const expectedResult = {
      statusCode: 200,
      body: { message: `state has been updated in package ${CAPITATED_INITIAL_ITEM_ID}.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });
});
