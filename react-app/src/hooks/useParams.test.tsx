import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import LZ from "lz-string";
import { useLzUrl } from "./useParams";

// Mock router utilities
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

describe("useLzUrl hook", () => {
  it("should initialize state from initValue if no query parameter exists", () => {
    // Mock useSearchParams to simulate no query parameter
    const mockSetParams = vi.fn();
    (useSearchParams as any).mockReturnValue([new URLSearchParams(), mockSetParams]);

    const { result } = renderHook(() =>
      useLzUrl({ key: "test", initValue: { foo: "bar" } }),
      { wrapper: MemoryRouter }
    );

    expect(result.current.state).toEqual({ foo: "bar" });
    expect(result.current.queryString).toBe("");
  });

  it("should initialize state from query parameter if it exists", () => {
    const mockSetParams = vi.fn();
    const compressedValue = LZ.compressToEncodedURIComponent(
      JSON.stringify({ foo: "baz" })
    );
    const mockParams = new URLSearchParams({ test: compressedValue });

    (useSearchParams as any).mockReturnValue([mockParams, mockSetParams]);

    const { result } = renderHook(() =>
      useLzUrl({ key: "test", initValue: { foo: "bar" } }),
      { wrapper: MemoryRouter }
    );
  
    expect(result.current.state).toEqual({ foo: "baz" });
    expect(result.current.queryString).toBe(compressedValue);
  });

  it("should update the URL when onSet is called", () => {
    const mockSetParams = vi.fn();
    (useSearchParams as any).mockReturnValue([new URLSearchParams(), mockSetParams]);
 
    const { result } = renderHook(() =>
      useLzUrl({ key: "test", initValue: { foo: "bar" } }),
      { wrapper: MemoryRouter }
    );

    act(() => {
      result.current.onSet((prev) => ({ ...prev, foo: "baz" }));
    });

    const expectedCompressed = LZ.compressToEncodedURIComponent(
      JSON.stringify({ foo: "baz" })
    );

    expect(mockSetParams).toHaveBeenCalledWith(
      expect.any(Function),
      { replace: true }
    );
    const updatedParams = mockSetParams.mock.calls[0][0](new URLSearchParams());
    expect(updatedParams['test']).toBe(expectedCompressed);
  });

  it("should remove the query parameter when onClear is called", () => {
    const mockSetParams = vi.fn();
    const mockParams = new URLSearchParams({ test: "somevalue" });

    (useSearchParams as any).mockReturnValue([mockParams, mockSetParams]);

    const { result } = renderHook(() =>
      useLzUrl({ key: "test", initValue: { foo: "bar" } }),
      { wrapper: MemoryRouter }
    );

    // Adding a call to make it make sure it has a value to clear
    act(() => {
      result.current.onSet((prev) => ({ ...prev, foo: "baz" }));
    });
    act(() => {
      result.current.onClear();
    });
    // A new call is made on the clear
    expect(mockSetParams).toHaveBeenCalledWith(expect.anything());
    expect(mockSetParams).toHaveBeenCalledTimes(2);
    const updatedParams = mockSetParams.mock.calls[1][0](new URLSearchParams());
    expect(updatedParams).toStrictEqual(new URLSearchParams());
  });
});
