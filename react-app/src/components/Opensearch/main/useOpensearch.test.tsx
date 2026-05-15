import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  OS_DASHBOARD_REFRESH_EVENT,
  removeDraftStatusFilters,
  useOsAggregate,
  useOsData,
} from "./useOpensearch";

const { getOsDataMock, mutateAsyncMock, useLzUrlMock } = vi.hoisted(() => ({
  getOsDataMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  useLzUrlMock: vi.fn(),
}));
const mockUseFeatureFlag = vi.hoisted(() => vi.fn((flag: string) => flag === "SAVE_IN_PROGRESS"));

vi.mock("@/api", () => ({
  getOsData: getOsDataMock,
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

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
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

const AggregateProbe = () => {
  useOsAggregate();
  return null;
};

const renderWithQueryClient = (children: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("dashboard draft filters", () => {
  test("removes Draft status values from status filters", () => {
    expect(
      removeDraftStatusFilters([
        {
          label: "Status",
          field: "stateStatus.keyword",
          component: "multiCheck",
          prefix: "must",
          type: "terms",
          value: ["Draft", "Submitted"],
        },
      ]),
    ).toEqual([
      {
        label: "Status",
        field: "stateStatus.keyword",
        component: "multiCheck",
        prefix: "must",
        type: "terms",
        value: ["Submitted"],
      },
    ]);
  });

  test("drops status filters that only contain Draft", () => {
    expect(
      removeDraftStatusFilters([
        {
          label: "Status",
          field: "cmsStatus.keyword",
          component: "multiCheck",
          prefix: "must",
          type: "terms",
          value: ["Draft"],
        },
      ]),
    ).toEqual([]);
  });
});

describe("useOsData", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockUseFeatureFlag.mockImplementation((flag: string) => flag === "SAVE_IN_PROGRESS");
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

  test("opts dashboard search out of drafts when save-in-progress is disabled", async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    useLzUrlMock.mockReturnValue({
      state: {
        ...defaultState,
        filters: [
          {
            label: "Status",
            field: "stateStatus.keyword",
            component: "multiCheck",
            prefix: "must",
            type: "terms",
            value: ["Draft"],
          },
        ],
      },
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
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          includeDrafts: false,
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: "seatoolStatus.keyword",
              prefix: "must_not",
              type: "term",
              value: "Draft",
            }),
          ]),
        }),
        expect.any(Object),
      );
      expect(mutateAsyncMock.mock.calls[0][0].filters).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "stateStatus.keyword",
            value: ["Draft"],
          }),
        ]),
      );
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

describe("useOsAggregate", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockUseFeatureFlag.mockImplementation((flag: string) => flag === "SAVE_IN_PROGRESS");
  });

  test("opts dashboard aggregate options out of drafts when save-in-progress is disabled", async () => {
    mockUseFeatureFlag.mockReturnValue(false);
    getOsDataMock.mockResolvedValue({ aggregations: {} });
    useLzUrlMock.mockReturnValue({
      state: defaultState,
      queryString: "query",
      onSet: vi.fn(),
      onClear: vi.fn(),
    });

    renderWithQueryClient(<AggregateProbe />);

    await waitFor(() => {
      expect(getOsDataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          includeDrafts: false,
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: "seatoolStatus.keyword",
              prefix: "must_not",
              type: "term",
              value: "Draft",
            }),
          ]),
        }),
      );
    });
  });
});
