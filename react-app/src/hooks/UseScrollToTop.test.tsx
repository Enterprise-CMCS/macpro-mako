import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollToTop } from "./useScrollToTop";

describe("UseScrollToTop", () => {
  it("should return to top of the page after useScrollToTop is called", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo");

    renderHook(() => useScrollToTop());

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);

    scrollToSpy.mockRestore();
  });
});
