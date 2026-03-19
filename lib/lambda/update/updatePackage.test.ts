import {
  CAPITATED_INITIAL_ITEM_ID,
  CAPITATED_INITIAL_NEW_ITEM_ID,
  DELETED_ITEM_ID,
  EXISTING_ITEM_ID,
  EXISTING_ITEM_PENDING_ID,
  NEW_CHIP_ITEM_ID,
  SIMPLE_ID,
} from "mocks";
import { mockedProducer } from "mocks/helpers/kafka.utils";
import { APIGatewayEvent } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./updatePackage";

describe("handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
    mockedProducer.send.mockResolvedValue([{ partition: 0, offset: "1" }]);
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;
    const result = await handler(event);

    expect(result?.statusCode).toBe(400);
    expect(result?.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if package ID is not found", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", changeMade: "Nunya", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body || "{}")).toEqual({
      message: [
        {
          code: "invalid_type",
          expected: "'update-values' | 'update-id' | 'delete' | 'recover'",
          message: "Required",
          path: ["action"],
          received: "undefined",
        },
      ],
    });
  });

  it("should return 400 if action is not found", async () => {
    const noApackageEvent = {
      body: JSON.stringify({ action: "123", changeMade: "Nunya", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const result = await handler(noApackageEvent);

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body || "{}")).toEqual({
      message: [
        {
          code: "invalid_type",
          expected: "string",
          message: "Required",
          path: ["packageId"],
          received: "undefined",
        },
        {
          code: "invalid_enum_value",
          message:
            "Invalid enum value. Expected 'update-values' | 'update-id' | 'delete' | 'recover', received '123'",
          options: ["update-values", "update-id", "delete", "recover"],
          path: ["action"],
          received: "123",
        },
      ],
    });
  });

  describe("delete", () => {
    it("should return 404 if the package is not found", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: "123",
          action: "delete",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(404);
      expect(result?.body).toEqual(JSON.stringify({ message: "No record found for the given id" }));
    });

    it("should fail to delete a package if there is no topic name", async () => {
      process.env.topicName = "";
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "delete",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(500);
      expect(result?.body).toEqual(JSON.stringify({ message: "Topic name is not defined" }));
    });

    it("should delete a package", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "delete",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(JSON.stringify({ message: "MD-00-0000 has been deleted." }));
    });
  });

  describe("recover", () => {
    it("should fail to recover a package if there is no topic name", async () => {
      process.env.topicName = "";
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "recover",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(500);
      expect(result?.body).toEqual(JSON.stringify({ message: "Topic name is not defined" }));
    });

    it("should fail to recover a package if it is not deleted", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "recover",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "MD-00-0000 is not a deleted package." }),
      );
    });

    it("should recover a package", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: DELETED_ITEM_ID,
          action: "recover",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "MD-0000.R00.00 has been recovered." }),
      );
    });
  });

  describe("update-id", () => {
    it("should fail to update a package ID with no topic name", async () => {
      process.env.topicName = "";
      const noActionevent = {
        body: JSON.stringify({
          packageId: CAPITATED_INITIAL_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: "SS-1235.R00.00",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toStrictEqual(500);
      expect(result?.body).toEqual(JSON.stringify({ message: "Topic name is not defined" }));
    });

    it("should fail to update a package with bad existing id format", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: SIMPLE_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: "SS-120",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(500);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: "The type of package could not be determined.",
        }),
      );
    });

    it("should fail to update a package ID with bad new id format", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: CAPITATED_INITIAL_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: "SS-120",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(JSON.parse(result?.body || JSON.stringify("[\n {\n }\n ]")))?.[0]).toEqual({
        code: "custom",
        message:
          "The Initial Waiver Number must be in the format of SS-####.R00.00 or SS-#####.R00.00",
        path: [],
      });
    });

    it("should fail to update an ID on a package - missing new ID", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "New ID required to update package" }),
      );
    });

    it("should fail to update an ID on a package - same ID", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: EXISTING_ITEM_ID,
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "New ID required to update package" }),
      );
    });

    it("should fail to update an ID on a package - existing ID", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: EXISTING_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: EXISTING_ITEM_PENDING_ID,
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(JSON.stringify({ message: "This ID already exists" }));
    });

    it("should update an ID on a package", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: CAPITATED_INITIAL_ITEM_ID,
          action: "update-id",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedId: CAPITATED_INITIAL_NEW_ITEM_ID,
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: `The ID of package ${CAPITATED_INITIAL_ITEM_ID} has been updated to ${CAPITATED_INITIAL_NEW_ITEM_ID}.`,
        }),
      );

      expect(mockedProducer.send).toHaveBeenCalledTimes(3);
    });
  });

  describe("update-values", () => {
    it("should fail to update a package - no topic name ", async () => {
      process.env.topicName = "";
      const noActionevent = {
        body: JSON.stringify({
          packageId: SIMPLE_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: {},
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(500);
      expect(result?.body).toEqual(JSON.stringify({ message: "Topic name is not defined" }));
    });

    it("should fail to update a package - No valid fields ", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: SIMPLE_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { badfield: "nothing" },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "Cannot update invalid field(s): badfield" }),
      );
    });

    it("should fail to update a package - Id can not be updated ", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: SIMPLE_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { id: "cant update ID here" },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({ message: "ID is not a valid field to update" }),
      );
    });

    it("should update a package", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: CAPITATED_INITIAL_ITEM_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { state: "TX" },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: `state has been updated in package ${CAPITATED_INITIAL_ITEM_ID}.`,
        }),
      );

      expect(mockedProducer.send).toHaveBeenCalledTimes(1);
    });

    it("should update chipSubmissionType even if missing on the record", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: NEW_CHIP_ITEM_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { chipSubmissionType: ["Non-Financial Eligibility"] },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(200);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: `chipSubmissionType has been updated in package ${NEW_CHIP_ITEM_ID}.`,
        }),
      );

      expect(mockedProducer.send).toHaveBeenCalledTimes(1);
    });

    it("should reject chipSubmissionType updates for non-CHIP SPA packages", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: CAPITATED_INITIAL_ITEM_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { chipSubmissionType: ["Non-Financial Eligibility"] },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: "CHIP Submission Type updates are only allowed for CHIP SPA packages.",
        }),
      );
    });

    it("should reject invalid chipSubmissionType values", async () => {
      const noActionevent = {
        body: JSON.stringify({
          packageId: NEW_CHIP_ITEM_ID,
          action: "update-values",
          changeMade: "Nunya",
          changeReason: "Nunya",
          updatedFields: { chipSubmissionType: ["Bad Value"] },
        }),
      } as APIGatewayEvent;

      const result = await handler(noActionevent);

      expect(result?.statusCode).toBe(400);
      expect(result?.body).toEqual(
        JSON.stringify({
          message: "Invalid CHIP Submission Type value(s).",
        }),
      );
    });
  });
});
