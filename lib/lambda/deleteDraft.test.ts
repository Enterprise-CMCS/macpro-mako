import { Context } from "aws-lambda";
import * as packageApi from "libs/api/package";
import * as os from "libs/opensearch-lib";
import { getRequestContext, setDefaultStateSubmitter, setMockUsername, testReviewer } from "mocks";
import { APIGatewayEvent, SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./deleteDraft";

const DRAFT_ID = "MD-25-2525-SAVE";

const buildPackageResult = (
  seatoolStatus: (typeof SEATOOL_STATUS)[keyof typeof SEATOOL_STATUS],
  deleted = false,
) =>
  ({
    found: true,
    _id: DRAFT_ID,
    _source: {
      id: DRAFT_ID,
      state: "MD",
      authority: "Medicaid SPA",
      seatoolStatus,
      deleted,
    },
  }) as any;

describe("deleteDraft handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDefaultStateSubmitter();
    vi.spyOn(os, "updateData").mockResolvedValue(undefined as void);
  });

  it("returns 400 when event body is missing", async () => {
    const res = await handler(
      { requestContext: getRequestContext() } as APIGatewayEvent,
      {} as Context,
    );

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual(
      expect.objectContaining({ message: "Event body required" }),
    );
  });

  it("returns 403 when CMS user tries to delete a draft", async () => {
    setMockUsername(testReviewer);
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(buildPackageResult(SEATOOL_STATUS.DRAFT));

    const res = await handler(
      {
        body: JSON.stringify({ id: DRAFT_ID }),
        requestContext: getRequestContext(),
      } as APIGatewayEvent,
      {} as Context,
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
  });

  it("returns 409 when package is not an active draft", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(
      buildPackageResult(SEATOOL_STATUS.PENDING),
    );

    const res = await handler(
      {
        body: JSON.stringify({ id: DRAFT_ID }),
        requestContext: getRequestContext(),
      } as APIGatewayEvent,
      {} as Context,
    );

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual(
      JSON.stringify({ message: `Package ${DRAFT_ID} is not an active draft.` }),
    );
    expect(os.updateData).not.toHaveBeenCalled();
  });

  it("soft deletes a draft package", async () => {
    vi.spyOn(packageApi, "getPackage").mockResolvedValue(buildPackageResult(SEATOOL_STATUS.DRAFT));

    const res = await handler(
      {
        body: JSON.stringify({ id: DRAFT_ID }),
        requestContext: getRequestContext(),
      } as APIGatewayEvent,
      {} as Context,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({ message: "Draft deleted", id: DRAFT_ID }));
    expect(os.updateData).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: DRAFT_ID,
        body: expect.objectContaining({
          doc: expect.objectContaining({ deleted: true }),
          doc_as_upsert: false,
        }),
      }),
    );
  });
});
