import { renderHook, waitFor } from "@testing-library/react";
import { setDefaultReviewer, setDefaultStateSubmitter, setMockUsername } from "mocks";
import { afterAll, describe, expect, it } from "vitest";

import { queryClientWrapper } from "@/utils/test-helpers";

import { useReadOnlyUser } from "./useReadOnlyUser";

const setup = async () => {
  const { result } = renderHook(() => useReadOnlyUser(), {
    wrapper: queryClientWrapper,
  });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result.current.readOnly;
};

describe("UseReadOnlyUser", () => {
  afterAll(() => {
    setDefaultStateSubmitter();
  });

  it("returns false if user has more than read only access", async () => {
    setDefaultStateSubmitter();
    const readOnly = await setup();
    expect(readOnly).toBe(false);
  });

  it("returns false if user has more than read only access", async () => {
    setDefaultStateSubmitter();
    const readOnly = await setup();
    expect(readOnly).toBe(false);
  });

  it("returns true if user only has read only access", async () => {
    setDefaultReviewer();
    const readOnly = await setup();
    expect(readOnly).toBe(true);
  });

  it("returns true if user is logged out", async () => {
    setMockUsername();
    const readOnly = await setup();
    expect(readOnly).toBe(true);
  });
});
