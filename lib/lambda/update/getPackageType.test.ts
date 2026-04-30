import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPackageChangelog } = vi.hoisted(() => ({
  getPackageChangelog: vi.fn(),
}));

vi.mock("libs/api/package", () => ({
  getPackageChangelog,
}));

import { getPackageType } from "./getPackageType";

describe("getPackageType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips admin-only and workflow changelog events when finding a validation schema", async () => {
    vi.mocked(getPackageChangelog).mockResolvedValue({
      hits: {
        hits: [
          { _source: { event: "legacy-admin-change" } },
          { _source: { event: "toggle-withdraw-rai" } },
          { _source: { event: "new-medicaid-submission" } },
        ],
      },
    } as never);

    await expect(
      getPackageType({
        packageId: "ZZ-26-9033-P",
        authority: "Medicaid SPA",
        actionType: "New",
      }),
    ).resolves.toBe("new-medicaid-submission");
  });

  it("falls back to authority and action type when submission events are absent", async () => {
    vi.mocked(getPackageChangelog).mockResolvedValue({
      hits: {
        hits: [
          { _source: { event: "legacy-admin-change" } },
          { _source: { event: "NOSO" } },
        ],
      },
    } as never);

    await expect(
      getPackageType({
        packageId: "ZZ-26-9033-P",
        authority: "Medicaid SPA",
        actionType: "New",
      }),
    ).resolves.toBe("new-medicaid-submission");
  });
});
