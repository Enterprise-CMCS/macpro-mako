import { describe, it, vi, expect } from "vitest";
import { useReadOnlyUser } from "./useReadOnlyUser";

vi.mock("@/api", () => ({
  useGetUser: vi.fn().mockReturnValue({
    data: { user: { "custom:cms-roles": "onemac-micro-statesubmitter" } },
  }),
}));

describe("UseReadOnlyUser", () => {
  it("returns false if user has more than read only access", () => {
    expect(useReadOnlyUser()).toBe(false);
  });

  // mock return value again
});
