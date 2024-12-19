import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

describe("UseMediaQuery", () => {
  // https://vitest.dev/api/vi.html#vi-stubglobal
  it("returns false if viewport doesn't match media query", () => {
    globalThis.window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(result.current).toBe(false);
  });

  // cannot mock window being undefined
});
