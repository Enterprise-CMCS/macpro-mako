import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useCountdown } from ".";

const COUNTDOWN_TIME = 10;

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("Returns the correct initial value", () => {
    const { result } = renderHook(() => useCountdown(COUNTDOWN_TIME));

    expect(result.current[0]).toBe(COUNTDOWN_TIME);
  });

  test("Returns 0 after counting down", () => {
    const { result } = renderHook(() => useCountdown(COUNTDOWN_TIME));

    act(result.current[1].startCountdown);

    act(() => {
      vi.advanceTimersByTime(COUNTDOWN_TIME * 1000);
    });

    expect(result.current[0]).toBe(0);
  });

  test("Correctly starts the countdown", () => {
    const { result } = renderHook(() => useCountdown(COUNTDOWN_TIME));

    act(result.current[1].startCountdown);

    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });

    expect(result.current[0]).toBe(COUNTDOWN_TIME - 5);
  });

  test("Correctly stops the countdown", () => {
    const { result } = renderHook(() => useCountdown(COUNTDOWN_TIME));

    act(result.current[1].startCountdown);

    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });

    act(result.current[1].stopCountdown);

    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });

    expect(result.current[0]).toBe(COUNTDOWN_TIME - 5);
  });

  test("Correctly resets the countdown", () => {
    const { result } = renderHook(() => useCountdown(COUNTDOWN_TIME));

    act(result.current[1].startCountdown);

    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });

    act(result.current[1].resetCountdown);

    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });

    expect(result.current[0]).toBe(COUNTDOWN_TIME);
  });
});
