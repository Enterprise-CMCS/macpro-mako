import { renderHook } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { useLocalStorage, removeItemLocalStorage } from "./useLocalStorage";
import { Storage } from "@/utils/test-helpers";

describe("UseLocalStorage", () => {
  global.lobalStorage = new Storage();

  afterEach(() => {
    global.lobalStorage.clear();
  });
  it("sets local storage with key osQuery to null", () => {
    const { result } = renderHook(() => useLocalStorage("osQuery", null));
    expect(global.localStorage.getItem("osQuery")).toBe(null);
    expect(result.current[0]).toEqual(null);
  });

  it("returns initial value when localStorage contains invalid JSON", () => {
    global.localStorage.setItem("osData", "invalid JSON");

    const { result } = renderHook(() => useLocalStorage("osQuery", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("sets local storage with key osColumns to hidden columns", () => {
    const initialOsData = { osColumns: { spas: ["test"], waivers: ["test"] } };
    global.localStorage.setItem("osData", JSON.stringify(initialOsData));

    const { result } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );

    expect(global.localStorage.getItem("osData")).toBe(
      JSON.stringify({ osColumns: { spas: ["test"], waivers: ["test"] } }),
    );
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
  });

  it("holds values on rerender", () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
    rerender();
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
  });

  it("clears storage after removeItemLocalStorage is called  a key", () => {
    const { result } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );
    expect(global.localStorage.getItem("osData")).toBe(
      JSON.stringify({ osColumns: { spas: ["test"], waivers: ["test"] } }),
    );
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
    removeItemLocalStorage("osData");
    expect(global.localStorage.getItem("osData")).toBe(null);
  });

  it("clears storage after removeItemLocalStorage is called without a key", () => {
    const { result } = renderHook(() =>
      useLocalStorage("osColumns", { spas: ["test"], waivers: ["test"] }),
    );
    expect(global.localStorage.getItem("osData")).toBe(
      JSON.stringify({ osColumns: { spas: ["test"], waivers: ["test"] } }),
    );
    expect(result.current[0]).toEqual({ spas: ["test"], waivers: ["test"] });
    removeItemLocalStorage();
    expect(global.localStorage.getItem("osData")).toBe(null);
  });
});
