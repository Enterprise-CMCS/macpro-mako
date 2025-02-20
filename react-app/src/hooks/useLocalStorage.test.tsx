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

  it("sets local storage with key spaOSColumns to hidden columns", () => {
    const { result } = renderHook(() => useLocalStorage("spaOSColumns", ["test"]));
    expect(global.localStorage.getItem("spaOSColumns")).toBe(JSON.stringify(["test"]));
    expect(result.current[0]).toEqual(["test"]);
  });

  it("sets local storage with key waiverOSColumns to hidden columns", () => {
    const { result } = renderHook(() => useLocalStorage("waiversOSColumns", ["test"]));
    expect(global.localStorage.getItem("spaOSColumns")).toBe(JSON.stringify(["test"]));
    expect(result.current[0]).toEqual(["test"]);
  });

  it("holds values on rerender", () => {
    const { result, rerender } = renderHook(() => useLocalStorage("spaOSColumns", ["test"]));
    expect(result.current[0]).toEqual(["test"]);
    rerender();
    expect(result.current[0]).toEqual(["test"]);
  });

  it("clears storage after removeItemLocalStorage is called", () => {
    const { result } = renderHook(() => useLocalStorage("spaOSColumns", ["test"]));
    expect(global.localStorage.getItem("spaOSColumns")).toBe(JSON.stringify(["test"]));
    expect(result.current[0]).toEqual(["test"]);
    removeItemLocalStorage();
    expect(global.localStorage.getItem("spaOSColumns")).toBe(null);
  });
});
