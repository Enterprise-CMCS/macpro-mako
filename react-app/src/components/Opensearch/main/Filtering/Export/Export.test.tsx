import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers/renderForm";
import { getFilteredDocList } from "mocks";
import { BLANK_VALUE } from "@/consts";
import { OsExportData, OsTableColumn, FilterDrawerProvider } from "@/components";
import LZ from "lz-string";
import { ExportToCsv } from "export-to-csv";

const code = "094230fe-a02f-45d7-a675-05876ab5d76a";
const columns: OsTableColumn[] = [
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

const setup = (disabled?: boolean) => {
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
    <OsExportData columns={columns} disabled={disabled} />,
    [
      {
        path: "/dashboard",
        element: (
          <FilterDrawerProvider>
            <OsExportData columns={columns} disabled={disabled} />
          </FilterDrawerProvider>
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

describe("Tooltip component within export button", () => {
  it("Tooltip content hidden when not hovering", async () => {
    setup(true);

    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeInTheDocument();

    const tooltipContent = screen.queryByText("No records available");
    expect(tooltipContent).not.toBeInTheDocument();
  });

  it("Tooltip content shown on hover", async () => {
    const { user } = setup(true);

    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeTruthy();
    expect(tooltipTrigger).toBeDisabled();

    if (tooltipTrigger) user.hover(tooltipTrigger);

    await waitFor(() => screen.getByTestId("tooltip-content"));
    expect(screen.queryAllByText("No records available")[0]).toBeVisible();
  });

  it("should export on click if button is enabled", async () => {
    const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});
    const expected = getFilteredDocList(["CHIP SPA", "Medicaid SPA"]).map((doc) => ({
      Authority: doc.authority,
      "SPA ID": doc.id,
      State: doc.state,
    }));

    const { user } = setup(false);

    await user.click(screen.queryByTestId("tooltip-trigger"));

    expect(spy).toHaveBeenCalledWith(expected);
  });
});
