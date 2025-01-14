import { describe, it, expect, vi, afterEach } from "vitest";
import { getAppkChildren } from "./appk";
import {
  OPENSEARCH_DOMAIN,
  INITIAL_RELEASE_APPK_ITEM_ID,
  EXISTING_ITEM_APPROVED_APPK_ITEM_ID,
} from "mocks";

describe("getAppkChildren", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if osDomain is not defined", async () => {
    delete process.env.osDomain;
    await expect(getAppkChildren(INITIAL_RELEASE_APPK_ITEM_ID)).rejects.toThrow(
      "process.env.osDomain must be defined",
    );
    process.env.osDomain = OPENSEARCH_DOMAIN;
  });

  it("should return the children with the specified packageId and no additional filters", async () => {
    const result = await getAppkChildren(INITIAL_RELEASE_APPK_ITEM_ID);

    expect(result).toEqual(
      expect.objectContaining({
        hits: {
          total: {
            value: 1,
            relation: "eq",
          },
          max_score: null,
          hits: [
            {
              _source: {
                changedDate: "2024-01-01T00:00:00Z",
                title: "Initial release",
                cmsStatus: "Pending",
                stateStatus: "Under Review",
              },
            },
          ],
        },
      }),
    );
  });

  it("should return the children with the specified packageId and additional filters", async () => {
    const result = await getAppkChildren(EXISTING_ITEM_APPROVED_APPK_ITEM_ID, [
      { term: { cmsStatus: "Approved" } },
    ]);

    expect(result).toEqual(
      expect.objectContaining({
        hits: {
          total: {
            value: 1,
            relation: "eq",
          },
          max_score: null,
          hits: [
            {
              _source: {
                changedDate: "2025-01-08T00:00:00Z",
                title: "Approved release",
                cmsStatus: "Approved",
                stateStatus: "Approved",
              },
            },
          ],
        },
      }),
    );
  });
});
