import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers/renderForm";
import userEvent from "@testing-library/user-event";
import { BLANK_VALUE } from "@/consts";
import LZ from "lz-string";
import { OsFiltering, OsTableColumn, OsProvider, FilterDrawerProvider } from "@/components";
import { getFilteredItemList, getFilteredDocList } from "mocks";
import { opensearch } from "shared-types";
import { ExportToCsv } from "export-to-csv";

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
];

const setup = (
  columns: OsTableColumn[],
  onToggle: (field: string) => void,
  disabled?: boolean,
  hits: opensearch.Hits<opensearch.main.Document> = defaultHits,
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
    <OsFiltering columns={columns} onToggle={onToggle} disabled={disabled} />,
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
              <OsFiltering columns={columns} onToggle={onToggle} disabled={disabled} />
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

describe("Visibility button", () => {
  it("should display the filtering buttons", async () => {
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeEnabled();

    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();

    const exportBtn = screen.queryByRole("button", { name: "Export" });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeEnabled();
  });

  it("should display filtering button with hidden columns", async () => {
    const onToggle = vi.fn();
    setup(
      [
        ...defaultColumns,
        {
          field: "authority.keyword",
          label: "Authority",
          transform: (data) => data.authority ?? BLANK_VALUE,
          cell: (data) => data.authority ?? BLANK_VALUE,
        },
        {
          field: "origin.keyword",
          label: "Submission Source",
          hidden: true,
          transform: (data) => data.origin ?? BLANK_VALUE,
          cell: (data) => data.origin ?? BLANK_VALUE,
        },
      ],
      onToggle,
      false,
    );

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeEnabled();

    expect(screen.queryByRole("button", { name: "Columns (1 hidden)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("should display the filtering buttons with disabled search", async () => {
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, true);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeDisabled();

    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("should display the filtering buttons with Export disabled", async () => {
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false, {
      hits: [],
      max_score: 5,
      total: { value: 0, relation: "eq" },
    });

    expect(
      screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();

    const exportBtn = screen.queryByRole("button", { name: "Export" });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeDisabled();
  });

  it("should handle searching", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    await user.type(search, "testing[Enter]");
    expect(search).toHaveValue("testing");
  });

  it("should handle clicking the Columns button", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false);

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.queryByRole("button", { name: "Columns" }));
    const columns = screen.queryByRole("dialog");
    expect(columns).toBeInTheDocument();
    expect(within(columns).getByText("SPA ID")).toBeInTheDocument();
    expect(within(columns).getByText("State")).toBeInTheDocument();
    expect(within(columns).getByText("Authority")).toBeInTheDocument();
  });

  it("should handle clicking the Filters button", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false);

    const filters = screen.getByRole("button", { name: "Filters" });
    expect(filters.getAttribute("data-state")).toEqual("closed");
    await user.click(filters);
    expect(screen.getByRole("heading", { name: "Filters", level: 4 })).toBeInTheDocument();
  });

  it("should handle clicking the Export button", async () => {
    const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});
    const expected = getFilteredDocList(["CHIP SPA", "Medicaid SPA"]).map((doc) => ({
      Authority: doc.authority,
      "SPA ID": doc.id,
      State: doc.state,
    }));
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(defaultColumns, onToggle, false);

    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(spy).toHaveBeenCalledWith(expected);
  });
});
