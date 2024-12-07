import { describe, it, expect, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReadOnlyUser } from "./useReadOnlyUser";
import { queryClientWrapper } from "@/utils/test-helpers/renderForm";
import { setMockUsername, useDefaultReviewer, useDefaultStateSubmitter } from "mocks";

const setup = async () => {
  const { result } = renderHook(() => useReadOnlyUser(), {
    wrapper: queryClientWrapper,
  });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result.current.readOnly;
};

describe("UseReadOnlyUser", () => {
  afterAll(() => {
    useDefaultStateSubmitter();
  });

  it("returns false if user has more than read only access", async () => {
    useDefaultStateSubmitter();
    const readOnly = await setup();
    expect(readOnly).toBe(false);
  });

  it("returns false if user has more than read only access", async () => {
    useDefaultStateSubmitter();
    const readOnly = await setup();
    expect(readOnly).toBe(false);
  });

  it("returns true if user only has read only access", async () => {
    useDefaultReviewer();
    const readOnly = await setup();
    expect(readOnly).toBe(true);
  });

  it("returns true if user is logged out", async () => {
    setMockUsername();
    const readOnly = await setup();
    expect(readOnly).toBe(true);
  });
});
