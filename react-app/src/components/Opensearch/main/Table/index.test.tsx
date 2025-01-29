import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers/renderForm";
import userEvent from "@testing-library/user-event";
import { BLANK_VALUE } from "@/consts";
import LZ from "lz-string";
import { opensearch } from "shared-types";
import { OsTable, OsTableColumn, OsProvider, FilterDrawerProvider } from "@/components";
import { getFilteredItemList } from "mocks";

const code = "094230fe-a02f-45d7-a675-05876ab5d76a";
const items: opensearch.Hit<opensearch.main.Document>[] = getFilteredItemList([
  "CHIP SPA",
  "Medicaid SPA",
]).map((item) => ({ ...item, found: undefined }) as opensearch.Hit<opensearch.main.Document>);
const defaultHits: opensearch.Hits<opensearch.main.Document> = {
  hits: items,
  max_score: 5,
  total: { value: items.length, relation: "eq" },
};
const defaultColumns: OsTableColumn[] = [
  {
    props: { className: "w-[150px]" },
    field: "id.keyword",
    label: "SPA ID",
    locked: true,
    transform: (data) => data.id ?? BLANK_VALUE,
    cell: (data) => data.id ?? BLANK_VALUE,
  },
  {
    field: "state.keyword",
    label: "State",
    transform: (data) => data.state ?? BLANK_VALUE,
    cell: (data) => data.state ?? BLANK_VALUE,
  },
  {
    field: "authority.keyword",
    label: "Authority",
    transform: (data) => data.authority ?? BLANK_VALUE,
    cell: (data) => data.authority ?? BLANK_VALUE,
  },
  {
    field: "raiReceivedDate",
    label: "Formal RAI Response",
    cell: (data) => data.raiReceivedDate ?? BLANK_VALUE,
  },
  {
    field: "origin.keyword",
    label: "Submission Source",
    hidden: true,
    transform: (data) => data.origin ?? BLANK_VALUE,
    cell: (data) => data.origin ?? BLANK_VALUE,
  },
];

const setup = (
  columns: OsTableColumn[],
  onToggle: (field: string) => void,
  hits: opensearch.Hits<opensearch.main.Document>,
) => {
  const user = userEvent.setup();
  const queryString = LZ.compressToEncodedURIComponent(
    JSON.stringify({
      filters: [],
      search: "",
      tab: "spas",
      pagination: {
        number: 0,
        size: 25,
      },
      sort: {
        field: "submissionDate",
        order: "desc",
      },
      code,
    }),
  );
  const rendered = renderWithQueryClientAndMemoryRouter(
    <OsTable columns={columns} onToggle={onToggle} />,
    [
      {
        path: "/dashboard",
        element: (
          <OsProvider
            value={{
              data: hits,
              error: null,
              isLoading: false,
            }}
          >
            <FilterDrawerProvider>
              <OsTable columns={columns} onToggle={onToggle} />
            </FilterDrawerProvider>
          </OsProvider>
        ),
      },
    ],
    {
      initialEntries: [
        {
          pathname: "/dashboard",
          search: `code=${code}&os=${queryString}`,
        },
      ],
    },
  );
  return {
    user,
    ...rendered,
  };
};

describe("", () => {
  it("should", () => {
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, defaultHits);
    screen.debug();
  });
});
