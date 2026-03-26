import { Context } from "aws-lambda";
import * as authApi from "libs/api/auth/user";
import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import { getRequestContext } from "mocks";
import { APIGatewayEvent, SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./saveDraft";
import * as userService from "./user-management/userManagementService";

const DRAFT_ID = "MD-25-2525-SAVE";

const baseEvent = {
  body: JSON.stringify({
    id: DRAFT_ID,
    event: "new-medicaid-submission",
    draftData: {
      id: DRAFT_ID,
      proposedEffectiveDate: 1771480800000,
    },
  }),
  requestContext: getRequestContext(),
} as APIGatewayEvent;

describe("saveDraft handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authApi, "isAuthorized").mockResolvedValue(true);
    vi.spyOn(authApi, "getAuthDetails").mockReturnValue({
      userId: "mock-user-id",
      poolId: "mock-pool-id",
    });
    vi.spyOn(authApi, "lookupUserAttributes").mockResolvedValue({
      email: "state.user@example.com",
    } as any);
    vi.spyOn(userService, "getUserByEmail").mockResolvedValue({
      email: "state.user@example.com",
      fullName: "State User",
    } as any);
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(undefined as any);
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue(undefined as any);
    vi.spyOn(os, "updateData").mockResolvedValue(undefined as any);
  });

  it("writes deleted=false when creating a new draft", async () => {
    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          doc_as_upsert: true,
          doc: expect.objectContaining({
            deleted: false,
            seatoolStatus: SEATOOL_STATUS.DRAFT,
            draft: expect.objectContaining({
              draftOwnerEmail: "state.user@example.com",
              draftOwnerName: "State User",
            }),
          }),
        }),
      }),
    );
  });

  it("uses the selected temporary-extension draft authority when provided", async () => {
    const tempExtensionId = "MD-1198.R06.TE00";
    const temporaryExtensionEvent = {
      ...baseEvent,
      body: JSON.stringify({
        id: tempExtensionId,
        event: "temporary-extension",
        draftData: {
          ids: {
            id: tempExtensionId,
            validAuthority: {
              authority: "1915(c)",
            },
          },
        },
      }),
    } as APIGatewayEvent;

    const res = await handler(temporaryExtensionEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: tempExtensionId,
        body: expect.objectContaining({
          doc: expect.objectContaining({
            authority: "1915(c)",
          }),
        }),
      }),
    );
  });

  it("returns 400 when temporary-extension draft authority is missing", async () => {
    const tempExtensionId = "MD-1198.R06.TE00";
    const temporaryExtensionEvent = {
      ...baseEvent,
      body: JSON.stringify({
        id: tempExtensionId,
        event: "temporary-extension",
        draftData: {
          ids: {
            id: tempExtensionId,
            validAuthority: {
              authority: "",
            },
          },
        },
      }),
    } as APIGatewayEvent;

    const res = await handler(temporaryExtensionEvent, {} as Context);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Please select a Temporary Extension Type before saving.",
      }),
    );
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("reactivates a previously deleted draft id by replacing the stale draft document", async () => {
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 7,
      _primary_term: 3,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: true,
        submitterEmail: "old.user@example.com",
        submitterName: "Old User",
        draft: {
          savedAt: "2026-01-01T00:00:00.000Z",
          draftOwnerEmail: "old.user@example.com",
          draftOwnerName: "Old User",
          data: {
            id: DRAFT_ID,
            additionalInformation: "Old deleted draft information",
            attachments: {
              coverLetter: {
                files: [
                  {
                    filename: "stale.pdf",
                    key: "stale-key",
                    bucket: "stale-bucket",
                    uploadDate: 1,
                  },
                ],
              },
            },
          },
        },
      },
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        if_seq_no: 7,
        if_primary_term: 3,
        body: expect.objectContaining({
          script: expect.objectContaining({
            lang: "painless",
            source: "ctx._source = params.record",
            params: {
              record: expect.objectContaining({
                deleted: false,
                seatoolStatus: SEATOOL_STATUS.DRAFT,
                submitterEmail: "state.user@example.com",
                submitterName: "State User",
                draft: expect.objectContaining({
                  draftOwnerEmail: "state.user@example.com",
                  draftOwnerName: "State User",
                  data: {
                    id: DRAFT_ID,
                    proposedEffectiveDate: 1771480800000,
                  },
                }),
              }),
            },
          }),
          upsert: expect.objectContaining({
            deleted: false,
            seatoolStatus: SEATOOL_STATUS.DRAFT,
            draft: expect.objectContaining({
              data: {
                id: DRAFT_ID,
                proposedEffectiveDate: 1771480800000,
              },
            }),
          }),
        }),
      }),
    );
  });

  it("returns 409 when active draft save misses optimistic concurrency values", async () => {
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 10,
      _primary_term: 2,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: false,
      },
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Draft was updated by another user. Refresh this page and try saving again.",
      }),
    );
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("returns 409 when active draft save has stale optimistic concurrency values", async () => {
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 11,
      _primary_term: 2,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: false,
      },
    } as any);

    const eventWithStaleVersion = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 10,
        ifPrimaryTerm: 2,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithStaleVersion, {} as Context);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Draft was updated by another user. Refresh this page and try saving again.",
      }),
    );
    expect(os.updateData).not.toHaveBeenCalled();
  });
  it("replaces draft owner when a different user saves the draft", async () => {
    vi.spyOn(authApi, "lookupUserAttributes").mockResolvedValue({
      email: "another.user@example.com",
    } as any);
    vi.spyOn(userService, "getUserByEmail").mockResolvedValue({
      email: "another.user@example.com",
      fullName: "Another User",
    } as any);

    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 10,
      _primary_term: 2,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: false,
        submitterEmail: "state.user@example.com",
        submitterName: "State User",
        draft: {
          savedAt: "2026-01-01T00:00:00.000Z",
          draftOwnerEmail: "another.user@example.com",
          draftOwnerName: "Another User",
          data: { id: DRAFT_ID },
        },
      },
    } as any);

    const eventWithCurrentVersion = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 10,
        ifPrimaryTerm: 2,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithCurrentVersion, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        if_seq_no: 10,
        if_primary_term: 2,
        body: expect.objectContaining({
          doc_as_upsert: false,
          doc: expect.objectContaining({
            submitterEmail: "another.user@example.com",
            submitterName: "Another User",
            draft: expect.objectContaining({
              draftOwnerEmail: "another.user@example.com",
              draftOwnerName: "Another User",
            }),
          }),
        }),
      }),
    );
  });

  it("returns 409 when OpenSearch reports a version conflict during compare-and-write", async () => {
    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 12,
      _primary_term: 1,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: false,
      },
    } as any);

    vi.spyOn(os, "updateData").mockRejectedValueOnce({
      meta: {
        body: {
          error: {
            type: "version_conflict_engine_exception",
          },
        },
      },
    });

    const eventWithCurrentVersion = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 12,
        ifPrimaryTerm: 1,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithCurrentVersion, {} as Context);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "Draft was updated by another user. Refresh this page and try saving again.",
      }),
    );
  });
});
