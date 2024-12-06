import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("UseDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("start value", 500));
    expect(result.current).toBe("start value");
  });

  it("returns updated value after the specified delay", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "start value", delay: 500 },
    });

    expect(result.current).toBe("start value");
    rerender({ value: "new value", delay: 500 });
    expect(result.current).toBe("start value");

    // Ensures that the behavior in your tests matches what happens in the browser
    // more closely by executing pending useEffects before returning
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("new value");
  });
});
