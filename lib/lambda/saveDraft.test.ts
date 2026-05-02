import { Context } from "aws-lambda";
import * as authApi from "libs/api/auth/user";
import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import {
  coStateSubmitter,
  getRequestContext,
  helpDeskUser,
  setDefaultStateSubmitter,
  setMockUsername,
  testReviewer,
} from "mocks";
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
  beforeEach(async () => {
    vi.clearAllMocks();
    await setDefaultStateSubmitter();
    vi.spyOn(authApi, "getAuthDetails").mockReturnValue({
      userId: "mock-user-id",
      poolId: "mock-pool-id",
    });
    vi.spyOn(authApi, "lookupUserAttributes").mockResolvedValue({
      email: "state.user@example.com",
    } as any);
    vi.spyOn(userService, "getLatestActiveRoleByEmail").mockResolvedValue({
      role: "statesubmitter",
    } as any);
    vi.spyOn(userService, "getActiveStatesForUserByEmail").mockResolvedValue(["MD"]);
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
        refresh: true,
        body: expect.objectContaining({
          scripted_upsert: true,
          upsert: {},
          script: expect.objectContaining({
            params: {
              record: expect.objectContaining({
                deleted: false,
                seatoolStatus: SEATOOL_STATUS.DRAFT,
                draft: expect.objectContaining({
                  createdByEmail: "state.user@example.com",
                  createdByName: "State User",
                  updatedByEmail: "state.user@example.com",
                  updatedByName: "State User",
                  draftOwnerEmail: "state.user@example.com",
                  draftOwnerName: "State User",
                }),
              }),
            },
          }),
        }),
      }),
    );
  });

  it("returns 403 when a CMS user tries to save a draft", async () => {
    await setMockUsername(testReviewer);
    vi.spyOn(userService, "getLatestActiveRoleByEmail").mockResolvedValue({
      role: "reviewer",
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Only state users can save drafts." }));
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("returns 403 when a helpdesk user tries to save a draft", async () => {
    await setMockUsername(helpDeskUser);
    vi.spyOn(userService, "getLatestActiveRoleByEmail").mockResolvedValue({
      role: "helpdesk",
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Only state users can save drafts." }));
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("returns 403 when a state user tries to save a draft for a state they do not have access to", async () => {
    await setMockUsername(coStateSubmitter);
    vi.spyOn(userService, "getActiveStatesForUserByEmail").mockResolvedValue(["CO"]);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
    expect(os.updateData).not.toHaveBeenCalled();
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
          script: expect.objectContaining({
            params: {
              record: expect.objectContaining({
                authority: "1915(c)",
              }),
            },
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
        refresh: true,
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
                  createdByEmail: "state.user@example.com",
                  createdByName: "State User",
                  updatedByEmail: "state.user@example.com",
                  updatedByName: "State User",
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
        }),
      }),
    );
  });

  it("does not treat malformed main shell docs as active packages when reusing a deleted draft id", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _source: {
        id: DRAFT_ID,
        changedDate: "2026-04-27T19:56:38.000Z",
      },
    } as any);

    vi.spyOn(packageApi, "getDraftPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _seq_no: 7,
      _primary_term: 3,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: true,
        draft: {
          savedAt: "2026-01-01T00:00:00.000Z",
          data: {
            id: DRAFT_ID,
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
        refresh: true,
        if_seq_no: 7,
        if_primary_term: 3,
      }),
    );
  });

  it("returns 409 when a new draft save targets an active draft id", async () => {
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
        message: "This package ID is already in use. Update the ID before saving or submitting.",
      }),
    );
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("returns 409 when a create-only draft save races with another create", async () => {
    vi.spyOn(os, "updateData").mockRejectedValueOnce({
      meta: {
        body: {
          error: {
            type: "script_exception",
            reason: "draft_id_conflict",
          },
        },
      },
    });

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual(
      JSON.stringify({
        message: "This package ID is already in use. Update the ID before saving or submitting.",
      }),
    );
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          scripted_upsert: true,
          upsert: {},
        }),
      }),
    );
  });

  it("returns 409 when active draft update misses optimistic concurrency values", async () => {
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

    const eventWithoutVersion = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        originalDraftId: DRAFT_ID,
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithoutVersion, {} as Context);

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
        originalDraftId: DRAFT_ID,
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
  it("preserves draft creator and records latest updater when a different user saves the draft", async () => {
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
          createdAt: "2026-01-01T00:00:00.000Z",
          createdByEmail: "state.user@example.com",
          createdByName: "State User",
          draftOwnerEmail: "state.user@example.com",
          draftOwnerName: "State User",
          data: { id: DRAFT_ID },
        },
      },
    } as any);

    const eventWithCurrentVersion = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        originalDraftId: DRAFT_ID,
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
              createdByEmail: "state.user@example.com",
              createdByName: "State User",
              updatedByEmail: "another.user@example.com",
              updatedByName: "Another User",
              draftOwnerEmail: "state.user@example.com",
              draftOwnerName: "State User",
            }),
          }),
        }),
      }),
    );
  });

  it("moves an active draft when the package id changes", async () => {
    const nextDraftId = "MD-25-2526-SAVE";
    vi.spyOn(packageApi, "getDraftPackage").mockImplementation(async (id) => {
      if (id === nextDraftId) {
        return undefined as any;
      }

      return {
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
            createdAt: "2026-01-01T00:00:00.000Z",
            createdByEmail: "state.user@example.com",
            createdByName: "State User",
            data: { id: DRAFT_ID },
          },
        },
      } as any;
    });

    const eventWithChangedId = {
      ...baseEvent,
      body: JSON.stringify({
        id: nextDraftId,
        originalDraftId: DRAFT_ID,
        event: "new-medicaid-submission",
        draftData: {
          id: nextDraftId,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 10,
        ifPrimaryTerm: 2,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithChangedId, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        id: nextDraftId,
        body: expect.objectContaining({
          scripted_upsert: true,
          upsert: {},
          script: expect.objectContaining({
            params: {
              record: expect.objectContaining({
                id: nextDraftId,
                draft: expect.objectContaining({
                  createdByEmail: "state.user@example.com",
                  updatedByEmail: "state.user@example.com",
                  data: expect.objectContaining({ id: nextDraftId }),
                }),
              }),
            },
          }),
        }),
      }),
    );
    expect(os.updateData).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        if_seq_no: 10,
        if_primary_term: 2,
        body: expect.objectContaining({
          doc: expect.objectContaining({ deleted: true }),
          doc_as_upsert: false,
        }),
      }),
    );
  });

  it("returns 403 when moving from an original draft id outside the user's states", async () => {
    const eventWithCrossStateOriginalDraft = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        originalDraftId: "CO-25-2525-SAVE",
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 10,
        ifPrimaryTerm: 2,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithCrossStateOriginalDraft, {} as Context);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("returns 403 when the source draft record state is outside the user's states", async () => {
    const originalDraftId = "MD-25-2524-SAVE";
    vi.spyOn(packageApi, "getDraftPackage").mockImplementation(async (id) => {
      if (id === DRAFT_ID) {
        return undefined as any;
      }

      return {
        found: true,
        _id: originalDraftId,
        _seq_no: 10,
        _primary_term: 2,
        _source: {
          id: originalDraftId,
          state: "CO",
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          deleted: false,
        },
      } as any;
    });

    const eventWithCrossStateSourceDraft = {
      ...baseEvent,
      body: JSON.stringify({
        id: DRAFT_ID,
        originalDraftId,
        event: "new-medicaid-submission",
        draftData: {
          id: DRAFT_ID,
          proposedEffectiveDate: 1771480800000,
        },
        ifSeqNo: 10,
        ifPrimaryTerm: 2,
      }),
    } as APIGatewayEvent;

    const res = await handler(eventWithCrossStateSourceDraft, {} as Context);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
    expect(os.updateData).not.toHaveBeenCalled();
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
        originalDraftId: DRAFT_ID,
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
