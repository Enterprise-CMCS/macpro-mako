import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";

import { OS_DASHBOARD_REFRESH_EVENT, useOsData } from "./useOpensearch";

const { mutateAsyncMock, useLzUrlMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  useLzUrlMock: vi.fn(),
}));

vi.mock("@/api", () => ({
  getOsData: vi.fn(),
  useGetUser: vi.fn(() => ({ data: undefined })),
  useOsSearch: vi.fn(() => ({
    mutateAsync: mutateAsyncMock,
    isLoading: false,
    error: null,
  })),
}));

vi.mock("@/hooks", () => ({
  useLzUrl: useLzUrlMock,
}));

const defaultState = {
  filters: [],
  search: "",
  tab: "spas",
  pagination: { number: 0, size: 100 },
  sort: { field: "makoChangedDate", order: "desc" },
};

const Probe = () => {
  useOsData();
  return null;
};

describe("useOsData", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("refreshes dashboard data when the dashboard refresh event is dispatched", async () => {
    useLzUrlMock.mockReturnValue({
      state: defaultState,
      queryString: "query",
      onSet: vi.fn(),
      onClear: vi.fn(),
    });
    mutateAsyncMock.mockImplementation(
      async (_query: unknown, options?: { onSuccess?: (data: unknown) => void }) => {
        options?.onSuccess?.({ hits: { hits: [], total: { value: 0, relation: "eq" } } });
      },
    );

    render(
      <MemoryRouter>
        <Probe />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      window.dispatchEvent(new Event(OS_DASHBOARD_REFRESH_EVENT));
    });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
    });
  });

  test("removes the dashboard refresh listener on unmount", async () => {
    useLzUrlMock.mockReturnValue({
      state: defaultState,
      queryString: "query",
      onSet: vi.fn(),
      onClear: vi.fn(),
    });
    mutateAsyncMock.mockImplementation(
      async (_query: unknown, options?: { onSuccess?: (data: unknown) => void }) => {
        options?.onSuccess?.({ hits: { hits: [], total: { value: 0, relation: "eq" } } });
      },
    );

    const { unmount } = render(
      <MemoryRouter>
        <Probe />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    });

    unmount();

    await act(async () => {
      window.dispatchEvent(new Event(OS_DASHBOARD_REFRESH_EVENT));
    });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
  });
});
