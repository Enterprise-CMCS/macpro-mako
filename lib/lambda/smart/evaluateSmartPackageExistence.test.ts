import * as os from "libs/opensearch-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { evaluateSmartPackageExistence } from "./evaluateSmartPackageExistence";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import * as publishSmartIngestErrorModule from "./publishSmartIngestError";

const event = Object.freeze({
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "al-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-08-17T16:54:33.000Z",
} satisfies SmartOnemacEvent);

const mainById = {
  found: true,
  _id: "AL-26-0817-0001",
  _source: { id: "AL-26-0817-0001", origin: "OneMAC" },
} as Awaited<ReturnType<typeof os.getItem>>;
const mainBySpaWaiverId = {
  hits: { hits: [{ _id: "OTHER-ID", _source: { spaWaiverId: event.spaWaiverId } }] },
};
const changelogById = {
  hits: { hits: [{ _id: "change-1", _source: { packageId: "AL-26-0817-0001" } }] },
};

const getItemSpy = vi.spyOn(os, "getItem");
const searchSpy = vi.spyOn(os, "search");
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);

describe("evaluateSmartPackageExistence", () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    process.env.osDomain = "https://search.example.test";
    process.env.indexNamespace = "test-";
    getItemSpy.mockResolvedValue(mainById);
    searchSpy.mockResolvedValueOnce(mainBySpaWaiverId).mockResolvedValueOnce(changelogById);
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
  });

  it("returns all three package-existence evaluations", async () => {
    await expect(evaluateSmartPackageExistence(event)).resolves.toEqual({
      mainById,
      mainBySpaWaiverId,
      changelogById,
    });
  });

  it("looks up the normalized ID, SPA waiver ID, and changelog package ID", async () => {
    await evaluateSmartPackageExistence(event);

    expect(getItemSpy).toHaveBeenCalledWith(
      "https://search.example.test",
      "test-main",
      "AL-26-0817-0001",
    );
    expect(searchSpy).toHaveBeenCalledTimes(2);

    const mainSearch = searchSpy.mock.calls.find(([, index]) => index === "test-main");
    const changelogSearch = searchSpy.mock.calls.find(([, index]) => index === "test-changelog");
    expect(mainSearch).toEqual([
      "https://search.example.test",
      "test-main",
      expect.objectContaining({
        query: expect.objectContaining({
          term: { spaWaiverId: event.spaWaiverId },
        }),
      }),
    ]);
    expect(changelogSearch).toEqual([
      "https://search.example.test",
      "test-changelog",
      expect.objectContaining({
        query: expect.objectContaining({
          bool: expect.objectContaining({
            must: expect.arrayContaining([{ term: { "packageId.keyword": "AL-26-0817-0001" } }]),
          }),
        }),
      }),
    ]);
  });

  it("treats missing documents and empty searches as a successful evaluation", async () => {
    const emptySearch = { hits: { hits: [] } };
    getItemSpy.mockResolvedValueOnce(undefined);
    searchSpy.mockReset();
    searchSpy.mockResolvedValue(emptySearch);

    await expect(evaluateSmartPackageExistence(event)).resolves.toEqual({
      mainById: undefined,
      mainBySpaWaiverId: emptySearch,
      changelogById: emptySearch,
    });
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });
});
