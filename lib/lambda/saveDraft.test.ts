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
    vi.spyOn(os, "updateData").mockResolvedValue(undefined as void);
  });

  it("writes deleted=false when creating a new draft", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(undefined as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          doc: expect.objectContaining({
            deleted: false,
            seatoolStatus: SEATOOL_STATUS.DRAFT,
            draft: expect.objectContaining({
              originalCreatorEmail: "state.user@example.com",
              originalCreatorName: "State User",
            }),
          }),
        }),
      }),
    );
  });

  it("reactivates a previously deleted draft id by forcing deleted=false and resetting creator", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: true,
        submitterEmail: "old.user@example.com",
        submitterName: "Old User",
        draft: {
          savedAt: "2026-01-01T00:00:00.000Z",
          originalCreatorEmail: "old.user@example.com",
          originalCreatorName: "Old User",
          data: { id: DRAFT_ID },
        },
      },
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          doc: expect.objectContaining({
            deleted: false,
            seatoolStatus: SEATOOL_STATUS.DRAFT,
            submitterEmail: "state.user@example.com",
            submitterName: "State User",
            draft: expect.objectContaining({
              originalCreatorEmail: "state.user@example.com",
              originalCreatorName: "State User",
            }),
          }),
        }),
      }),
    );
  });

  it("preserves the original draft creator when a different user saves the draft", async () => {
    vi.spyOn(authApi, "lookupUserAttributes").mockResolvedValue({
      email: "another.user@example.com",
    } as any);
    vi.spyOn(userService, "getUserByEmail").mockResolvedValue({
      email: "another.user@example.com",
      fullName: "Another User",
    } as any);

    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: false,
        submitterEmail: "state.user@example.com",
        submitterName: "State User",
        draft: {
          savedAt: "2026-01-01T00:00:00.000Z",
          originalCreatorEmail: "state.user@example.com",
          originalCreatorName: "State User",
          data: { id: DRAFT_ID },
        },
      },
    } as any);

    const res = await handler(baseEvent, {} as Context);

    expect(res.statusCode).toBe(200);
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          doc: expect.objectContaining({
            submitterEmail: "another.user@example.com",
            submitterName: "Another User",
            draft: expect.objectContaining({
              originalCreatorEmail: "state.user@example.com",
              originalCreatorName: "State User",
            }),
          }),
        }),
      }),
    );
  });
});
