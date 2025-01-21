// getPackageChangelog.test.ts
import { TEST_ITEM_ID, WITHDRAWN_CHANGELOG_ITEM_ID } from "mocks";
import items from "mocks/data/items";
import { describe, expect, it } from "vitest";
import { getPackageChangelog } from "./getPackageChangelog";

describe("getPackageChangelog", () => {
  it("should throw an error if osDomain is not defined", async () => {
    delete process.env.osDomain;
    await expect(getPackageChangelog(TEST_ITEM_ID)).rejects.toThrow(
      "process.env.osDomain must be defined",
    );
  });

  it("should return the changelog with the specified packageId and no additional filters", async () => {
    const expectedHits = items[WITHDRAWN_CHANGELOG_ITEM_ID]?._source?.changelog || [];
    const result = await getPackageChangelog(WITHDRAWN_CHANGELOG_ITEM_ID);

    expect(result).toBeTruthy();
    expect(result.hits.hits).toEqual(expectedHits);
  });

  it("should return the changelog with the specified packageId and additional filters", async () => {
    const expectedHit = items[WITHDRAWN_CHANGELOG_ITEM_ID]?._source?.changelog?.find(
      (log) => log?._source?.event == "withdraw-package",
    );
    const result = await getPackageChangelog(WITHDRAWN_CHANGELOG_ITEM_ID, [
      { term: { event: "withdraw-package" } },
    ]);

    expect(result).toBeTruthy();
    expect(result.hits.hits).toEqual([expectedHit]);
  });
});
