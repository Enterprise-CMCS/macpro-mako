import { APIGatewayEvent, Context } from "aws-lambda";
import {
  getRequestContext,
  helpDeskUser,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  setDefaultStateSubmitter,
  setMockUsername,
  testReviewer,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import * as packageApi from "../libs/api/package";
import { handler } from "./getAttachmentArchive";

describe("getAttachmentArchive handler", () => {
  beforeEach(() => {
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue(undefined as any);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
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

  it("returns 403 when a CMS reviewer requests a draft archive", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(undefined as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "draftmain",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Draft",
      },
    } as any);

    const event = {
      body: JSON.stringify({ id: "MD-26-9999-P", scope: "all", preferDraft: true }),
      requestContext: getRequestContext(testReviewer),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(403);
    expect(response.body).toBe(JSON.stringify({ message: "Not authorized to view this resource" }));
  });

  it("allows HelpDesk users to request draft archives", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "READY",
        filename: "archive.zip",
        url: "http://example.com/archive.zip",
      },
    });
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(undefined as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "draftmain",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Draft",
        event: "new-medicaid-submission",
        draft: {
          savedAt: "2026-03-20T00:00:00.000Z",
          data: {},
        },
      },
    } as any);

    const event = {
      body: JSON.stringify({ id: "MD-26-9999-P", scope: "all", preferDraft: true }),
      requestContext: getRequestContext(helpDeskUser),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
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

  it("uses synthetic draft changelog attachments when preferDraft is requested", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "READY",
        filename: "archive.zip",
        url: "http://example.com/archive.zip",
      },
    });
    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "main",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Submitted",
      },
    } as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "draftmain",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Draft",
        event: "new-medicaid-submission",
        draft: {
          savedAt: "2026-03-20T00:00:00.000Z",
          data: {
            attachments: {
              cmsForm179: {
                files: [
                  {
                    bucket: "bucket-1",
                    key: "draft-doc-001",
                    filename: "draft-contract.pdf",
                    uploadDate: 1772564996000,
                  },
                ],
              },
            },
          },
        },
      },
    } as any);
    const getPackageChangelogSpy = vi.spyOn(packageApi, "getPackageChangelog");

    const event = {
      body: JSON.stringify({ id: "MD-26-9999-P", scope: "all", preferDraft: true }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(getRequestedAttachmentArchiveStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: "MD-26-9999-P",
        changelog: [
          expect.objectContaining({
            _source: expect.objectContaining({
              id: "MD-26-9999-P-draft-activity",
              attachments: [
                expect.objectContaining({
                  bucket: "bucket-1",
                  key: "draft-doc-001",
                  filename: "draft-contract.pdf",
                }),
              ],
            }),
          }),
        ],
      }),
    );
    expect(getPackageChangelogSpy).not.toHaveBeenCalled();
  });

  it("uses the event schema label for synthetic draft attachments when the saved label is missing", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: false,
      response: {
        status: "READY",
        filename: "archive.zip",
        url: "http://example.com/archive.zip",
      },
    });
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(undefined as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-3422.R00.01",
      _index: "draftmain",
      _score: 1,
      _source: {
        id: "MD-3422.R00.01",
        state: "MD",
        seatoolStatus: "Draft",
        event: "app-k",
        draft: {
          savedAt: "2026-03-20T00:00:00.000Z",
          data: {
            attachments: {
              appk: {
                files: [
                  {
                    bucket: "bucket-1",
                    key: "draft-doc-001",
                    filename: "appendix-k.pdf",
                    uploadDate: 1772564996000,
                  },
                ],
              },
            },
          },
        },
      },
    } as any);

    const event = {
      body: JSON.stringify({ id: "MD-3422.R00.01", scope: "all", preferDraft: true }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(getRequestedAttachmentArchiveStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: "MD-3422.R00.01",
        changelog: [
          expect.objectContaining({
            _source: expect.objectContaining({
              attachments: [
                expect.objectContaining({
                  title: "1915(c) Appendix K Amendment Waiver Template",
                }),
              ],
            }),
          }),
        ],
      }),
    );
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

  it("queues a draft rebuild when a draft archive is pending and stale", async () => {
    getRequestedAttachmentArchiveStatus.mockResolvedValue({
      needsRebuild: true,
      response: {
        status: "PENDING",
        pollAfterSeconds: 3,
      },
    });
    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "main",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Submitted",
      },
    } as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: "MD-26-9999-P",
      _index: "draftmain",
      _score: 1,
      _source: {
        id: "MD-26-9999-P",
        state: "MD",
        seatoolStatus: "Draft",
        event: "new-medicaid-submission",
        draft: {
          savedAt: "2026-03-20T00:00:00.000Z",
          data: {
            attachments: {
              cmsForm179: {
                files: [
                  {
                    bucket: "bucket-1",
                    key: "draft-doc-001",
                    filename: "draft-contract.pdf",
                    uploadDate: 1772564996000,
                  },
                ],
              },
            },
          },
        },
      },
    } as any);

    const event = {
      body: JSON.stringify({ id: "MD-26-9999-P", scope: "all", preferDraft: true }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    expect(sendAttachmentArchiveRebuildRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        packageId: "MD-26-9999-P",
        preferDraft: true,
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
