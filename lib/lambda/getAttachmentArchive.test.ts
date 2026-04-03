import { APIGatewayEvent, Context } from "aws-lambda";
import {
  getRequestContext,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  setDefaultStateSubmitter,
  setMockUsername,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getRequestedAttachmentArchiveStatus, sendAttachmentArchiveRebuildRequest } = vi.hoisted(
  () => ({
    getRequestedAttachmentArchiveStatus: vi.fn(),
    sendAttachmentArchiveRebuildRequest: vi.fn(),
  }),
);

vi.mock("../attachment-archive/rebuild-queue", () => ({
  sendAttachmentArchiveRebuildRequest,
}));

vi.mock("./attachmentArchive-lib", () => ({
  getRequestedAttachmentArchiveStatus,
}));

import { handler } from "./getAttachmentArchive";

describe("getAttachmentArchive handler", () => {
  afterEach(async () => {
    getRequestedAttachmentArchiveStatus.mockReset();
    sendAttachmentArchiveRebuildRequest.mockReset();
    await setDefaultStateSubmitter();
  });

  it("returns 400 if the event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(JSON.stringify({ message: "Event body required" }));
  });

  it("returns 400 if the event body is invalid", async () => {
    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining({ message: "Event failed validation" }),
    );
  });

  it("returns 401 if the user is not authenticated", async () => {
    setMockUsername(null);
    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(401);
    expect(response.body).toBe(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("returns 403 if the user cannot view the package", async () => {
    const event = {
      body: JSON.stringify({ id: HI_TEST_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(403);
    expect(response.body).toBe(JSON.stringify({ message: "Not authorized to view this resource" }));
  });

  it("returns 404 when the package is not found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe(JSON.stringify({ message: "No record found for the given id" }));
  });

  it("returns the archive response payload when the archive is ready", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "READY",
        filename: "archive.zip",
        url: "http://example.com/archive.zip",
      },
    });

    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(
      JSON.stringify({
        status: "READY",
        filename: "archive.zip",
        url: "http://example.com/archive.zip",
      }),
    );
    expect(getRequestedAttachmentArchiveStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
        scope: "all",
      }),
    );
    expect(sendAttachmentArchiveRebuildRequest).not.toHaveBeenCalled();
  });

  it("queues a rebuild when the requested archive is pending and stale", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: true,
      response: {
        status: "PENDING",
        pollAfterSeconds: 3,
      },
    });

    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ status: "PENDING", pollAfterSeconds: 3 }));
    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
        source: "request",
      }),
    );
  });

  it("returns a terminal archive failure without queuing another rebuild", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "FAILED",
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      },
    });

    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(
      JSON.stringify({
        status: "FAILED",
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      }),
    );
    expect(sendAttachmentArchiveRebuildRequest).not.toHaveBeenCalled();
  });

  it("returns a 500 response when archive lookup throws unexpectedly", async () => {
    getRequestedAttachmentArchiveStatus.mockRejectedValue(new Error("boom"));

    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID, scope: "all" }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(JSON.stringify({ message: "Internal server error" }));
  });
});
