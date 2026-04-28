import { NOT_EXISTING_ITEM_ID, TEST_ITEM_ID } from "mocks";
import { produceMessage } from "libs/api/kafka";
import { APIGatewayEvent } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./submitNOSO";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn((data) => data),
}));

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
    const expectedResult = { statusCode: 400, body: { message: "Event body required" } };

    expect(result).toStrictEqual(expectedResult);
  });

  it("should return 400 if package ID is not found", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", changeReason: "Nunya", authority: "test" }),
    } as APIGatewayEvent;

    const resultPackage = await handler(noActionevent);

    expect(resultPackage?.statusCode).toBe(400);
  });
  it("should return 400 if admingChangeType is not found", async () => {
    const noApackageEvent = {
      body: JSON.stringify({ action: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultAction = await handler(noApackageEvent);

    expect(resultAction?.statusCode).toBe(400);
  });
  it("should return 400 if existing item is entered", async () => {
    const noActionevent = {
      body: JSON.stringify({
        id: TEST_ITEM_ID,
        adminChangeType: "NOSO",
        authority: "SPA",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        status: "submitted",
        changeMade: "change",
        mockEvent: "new-medicaid-submission",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 400,
      body: { message: `Package with id: ${TEST_ITEM_ID} already exists.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should submit a new item", async () => {
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        changeMade: "change",
        mockEvent: "new-medicaid-submission",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);

    const expectedResult = {
      statusCode: 200,
      body: { message: `${NOT_EXISTING_ITEM_ID} has been submitted.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should submit a new item with blank submitter info", async () => {
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        adminChangeType: "NOSO",
        submitterEmail: "",
        submitterName: null,
        changeMade: "change",
        mockEvent: "new-medicaid-submission",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);

    const expectedResult = {
      statusCode: 200,
      body: { message: `${NOT_EXISTING_ITEM_ID} has been submitted.` },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should fail to create a package ID with no topic name", async () => {
    process.env.topicName = "";
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        mockEvent: "new-medicaid-submission",
        changeMade: "change",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);
    const expectedResult = {
      statusCode: 500,
      body: { message: "Topic name is not defined" },
    };
    expect(result).toStrictEqual(expectedResult);
  });

  it("should submit a new item with validated attachments", async () => {
    const validItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        changeMade: "change",
        mockEvent: "new-medicaid-submission",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
        attachments: {
          cmsForm179: {
            label: "CMS-179 Form",
            files: [
              {
                filename: "cms-179.pdf",
                title: "cms-179",
                bucket: "test-bucket",
                key: "cms-179.pdf",
                uploadDate: 1735689600000,
              },
            ],
          },
          spaPages: {
            label: "SPA Pages",
            files: [
              {
                filename: "spa-pages.pdf",
                title: "spa-pages",
                bucket: "test-bucket",
                key: "spa-pages.pdf",
                uploadDate: 1735689600001,
              },
            ],
          },
        },
      }),
    } as APIGatewayEvent;

    const result = await handler(validItem);

    expect(result).toStrictEqual({
      statusCode: 200,
      body: { message: `${NOT_EXISTING_ITEM_ID} has been submitted.` },
    });
    expect(produceMessage).toHaveBeenCalledWith(
      "test-topic",
      NOT_EXISTING_ITEM_ID.toUpperCase(),
      expect.stringContaining('"attachments"'),
    );
  });

  it("should return 400 for unsupported NOSO mock events", async () => {
    const invalidItem = {
      body: JSON.stringify({
        id: NOT_EXISTING_ITEM_ID,
        authority: "Medicaid SPA",
        status: "submitted",
        submitterEmail: "test@email.com",
        submitterName: "Name",
        adminChangeType: "NOSO",
        changeMade: "change",
        mockEvent: "mock-event",
        changeReason: "reason",
        submissionDate: "1/1/2025",
        proposedDate: "12/1/2025",
      }),
    } as APIGatewayEvent;

    const result = await handler(invalidItem);

    expect(result).toStrictEqual({
      statusCode: 400,
      body: { message: "Unsupported NOSO mockEvent: mock-event" },
    });
  });
});
