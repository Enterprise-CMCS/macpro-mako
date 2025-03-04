import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("returns initial value when localStorage contains invalid JSON", () => {
    localStorage.setItem("osQuery", "invalid JSON");

    const { result } = renderHook(() => useLocalStorage("osQuery", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("sets and retrieves local storage correctly", () => {
    const initialOsData = { spas: ["test"], waivers: ["test"] };
    localStorage.setItem("osColumns", JSON.stringify(initialOsData));

    const { result } = renderHook(() => useLocalStorage("osColumns", { spas: [], waivers: [] }));

    expect(localStorage.getItem("osColumns")).toBe(JSON.stringify(initialOsData));
    expect(result.current[0]).toEqual(initialOsData);
  });

  it("updates local storage when state changes", () => {
    const { result } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );

    act(() => {
      result.current[1]({ spas: ["updated"], waivers: ["test"] });
    });

    expect(localStorage.getItem("osColumns")).toBe(
      JSON.stringify({ spas: ["updated"], waivers: ["test"] }),
    );
    expect(result.current[0]).toEqual({ spas: ["updated"], waivers: ["test"] });
  });

  it("holds values on rerender", () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );

    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
    rerender();
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
  });
});
