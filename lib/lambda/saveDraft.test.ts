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
          }),
        }),
      }),
    );
  });

  it("reactivates a previously deleted draft id by forcing deleted=false", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue({
      found: true,
      _id: DRAFT_ID,
      _source: {
        id: DRAFT_ID,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        deleted: true,
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
          }),
        }),
      }),
    );
  });
});
