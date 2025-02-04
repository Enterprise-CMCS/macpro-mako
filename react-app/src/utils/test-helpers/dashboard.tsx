import { expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { BLANK_VALUE } from "@/consts";
import LZ from "lz-string";
import React, { ReactElement } from "react";
import {
  ContextState,
  OsTableColumn,
  OsUrlState,
  OsProvider,
  FilterDrawerProvider,
} from "@/components";
import { opensearch } from "shared-types";
import { getFilteredItemList } from "mocks";
import { renderWithQueryClientAndMemoryRouter } from "./render";

// Common fields that exist across all document types
type CommonDocument = {
  id: string;
  state?: string;
  authority?: string;
  origin?: string;
  raiReceivedDate?: string;
  makoChangedDate?: string;
};

export const DEFAULT_COLUMNS: OsTableColumn[] = [
  {
    props: { className: "w-[150px]" },
    field: "id.keyword",
    label: "SPA ID",
    locked: true,
    transform: (data: CommonDocument) => data.id ?? BLANK_VALUE,
    cell: (data: CommonDocument) => data.id ?? BLANK_VALUE,
  },
  {
    field: "state.keyword",
    label: "State",
    transform: (data: CommonDocument) => data.state ?? BLANK_VALUE,
    cell: (data: CommonDocument) => data.state ?? BLANK_VALUE,
  },
  {
    field: "authority.keyword",
    label: "Authority",
    transform: (data: CommonDocument) => data.authority ?? BLANK_VALUE,
    cell: (data: CommonDocument) => data.authority ?? BLANK_VALUE,
  },
];

export const HIDDEN_COLUMN: OsTableColumn = {
  field: "origin.keyword",
  label: "Submission Source",
  hidden: true,
  transform: (data: CommonDocument) => data.origin ?? BLANK_VALUE,
  cell: (data: CommonDocument) => data.origin ?? BLANK_VALUE,
};

export const NO_TRANSFORM_COLUMN: OsTableColumn = {
  field: "raiReceivedDate",
  label: "Formal RAI Response",
  cell: (data: CommonDocument) => data.raiReceivedDate ?? BLANK_VALUE,
};

export const NO_FIELD_COLUMN: OsTableColumn = {
  label: "Latest Package Activity",
  transform: (data: CommonDocument) => data.makoChangedDate ?? BLANK_VALUE,
  cell: (data: CommonDocument) => data.makoChangedDate ?? BLANK_VALUE,
};

export const DEFAULT_FILTERS: opensearch.Filterable<opensearch.main.Field>[] = [
  {
    label: "State",
    field: "state.keyword",
    component: "multiSelect",
    prefix: "must",
    type: "terms",
    value: ["MD"],
  },
  {
    label: "Authority",
    field: "authority.keyword",
    component: "multiCheck",
    prefix: "must",
    type: "terms",
    value: ["CHIP SPA"],
  },
  {
    label: "RAI Withdraw Enabled",
    field: "raiWithdrawEnabled",
    component: "boolean",
    prefix: "must",
    type: "match",
    value: true,
  },
  {
    label: "Final Disposition",
    field: "finalDispositionDate",
    component: "dateRange",
    prefix: "must",
    type: "range",
    value: {
      gte: "2025-01-01T00:00:00.000Z",
      lte: "2025-01-01T23:59:59.999Z",
    },
  },
];

export const EMPTY_HITS: opensearch.Hits<opensearch.main.Document> = {
  hits: [],
  max_score: 5,
  total: { value: 0, relation: "eq" },
};

export const getFilteredHits = (
  authorities: string[],
): opensearch.Hits<opensearch.main.Document> => {
  const items = getFilteredItemList(authorities).map(
    (item) => ({ ...item, found: undefined }) as opensearch.Hit<opensearch.main.Document>,
  );
  return {
    hits: items,
    max_score: 5,
    total: { value: items.length, relation: "eq" },
  };
};

export const URL_CODE = "094230fe-a02f-45d7-a675-05876ab5d76a";

export const getDashboardQueryString = ({
  filters,
  search,
  tab,
  pagination,
  sort,
}: Partial<OsUrlState> = {}) => {
  const queryString = LZ.compressToEncodedURIComponent(
    JSON.stringify({
      filters: filters || [],
      search: search || "",
      tab: tab || "spas",
      pagination: pagination || {
        number: 0,
        size: 25,
      },
      sort: sort || {
        field: "submissionDate",
        order: "desc",
      },
      URL_CODE,
    }),
  );
  return queryString;
};

export const renderDashboard = (element: ReactElement, value: ContextState, queryString: string) =>
  renderWithQueryClientAndMemoryRouter(
    <OsProvider value={value}>
      <FilterDrawerProvider>{element}</FilterDrawerProvider>
    </OsProvider>,
    [
      {
        path: "/dashboard",
        element: (
          <OsProvider value={value}>
            <FilterDrawerProvider>{element}</FilterDrawerProvider>
          </OsProvider>
        ),
      },
    ],
    {
      initialEntries: [
        {
          pathname: "/dashboard",
          search: `code=${URL_CODE}&os=${queryString}`,
        },
      ],
    },
  );

export const renderFilterDrawer = (element: ReactElement, queryString: string) => {
  console.log({ element, queryString });
  return renderWithQueryClientAndMemoryRouter(
    <FilterDrawerProvider>{element}</FilterDrawerProvider>,
    [
      {
        path: "/dashboard",
        element: <FilterDrawerProvider>{element}</FilterDrawerProvider>,
      },
    ],
    {
      initialEntries: [
        {
          pathname: "/dashboard",
          search: `code=${URL_CODE}&os=${queryString}`,
        },
      ],
    },
  );
};

export const verifyFiltering = (hiddenCount: number = 0) => {
  const filtering = screen.getByTestId("filtering");
  const search = within(filtering).queryByLabelText(
    "Search by Package ID, CPOC Name, or Submitter Name",
  );
  expect(search).toBeInTheDocument();
  expect(search).toBeEnabled();

  expect(
    within(filtering).queryByRole("button", {
      name: hiddenCount === 0 ? "Columns" : `Columns (${hiddenCount} hidden)`,
    }),
  ).toBeInTheDocument();
  expect(within(filtering).queryByRole("button", { name: "Filters" })).toBeInTheDocument();

  const exportBtn = within(filtering).queryByRole("button", { name: "Export" });
  expect(exportBtn).toBeInTheDocument();
  expect(exportBtn).toBeEnabled();
};

export const verifyChips = (labels: string[]) => {
  if (labels.length === 0) {
    expect(screen.getByTestId("chips").childElementCount).toEqual(0);
  } else {
    const chips = screen.getByTestId("chips");
    labels.forEach((label) => {
      expect(within(chips).getByText(label)).toBeInTheDocument();
    });
  }
};

export const verifyPagination = (recordCount: number) => {
  const pagination = screen.getByTestId("pagination");
  expect(within(screen.getByTestId("pagination")).getByLabelText("Records per page:")).toHaveValue(
    "25",
  );
  expect(within(pagination).getByTestId("page-location").textContent).toEqual(
    `1-${recordCount < 25 ? recordCount : 25}of${recordCount}records`,
  );
  expect(within(pagination).getByLabelText("Pagination")).toBeInTheDocument();
};
