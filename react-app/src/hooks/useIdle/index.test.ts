import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useIdle } from ".";

const IDLE_TIME = 100;

describe("useIdle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("Returns correct initial value", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    expect(result.current).toBe(true);
  });

  test("Returns correct value on mouse event", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    expect(result.current).toBe(false);
  });

  test("Returns correct value on click event", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    act(() => {
      document.dispatchEvent(new MouseEvent("click"));
    });

    expect(result.current).toBe(false);
  });

  test("Returns correct value on scroll event", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    act(() => {
      document.dispatchEvent(new MouseEvent("scroll"));
    });

    expect(result.current).toBe(false);
  });

  test("Returns correct value on touch event", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    act(() => {
      document.dispatchEvent(new MouseEvent("touchmove"));
    });

    expect(result.current).toBe(false);
  });

  test("Returns correct value on keypress event", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME));

    act(() => {
      document.dispatchEvent(new MouseEvent("keypress"));
    });

    expect(result.current).toBe(false);
  });

  test("Returns correct initial value from initialState argument", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME, { initialState: false }));

    expect(result.current).toBe(false);
  });

  test("Returns correct value when timeout has elapsed", () => {
    const { result } = renderHook(() => useIdle(IDLE_TIME, { initialState: false }));

    act(() => {
      vi.advanceTimersByTime(IDLE_TIME);
    });

    expect(result.current).toBe(true);
  });
});
