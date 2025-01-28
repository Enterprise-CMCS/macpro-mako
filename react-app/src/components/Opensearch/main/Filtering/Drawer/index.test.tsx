import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers/renderForm";
import LZ from "lz-string";
import { OsFilterDrawer } from "./index";
import { FilterDrawerProvider } from "../FilterProvider";
import { opensearch } from "shared-types";

const routes = [
  {
    path: "/dashboard",
    element: (
      <FilterDrawerProvider>
        <OsFilterDrawer />
      </FilterDrawerProvider>
    ),
  },
];
const code = "094230fe-a02f-45d7-a675-05876ab5d76a";

const setup = (
  filters: opensearch.Filterable<opensearch.main.Field>[],
  tab: "spas" | "waivers",
) => {
  const user = userEvent.setup();
  const queryString = LZ.compressToEncodedURIComponent(
    JSON.stringify({
      filters,
      search: "",
      tab,
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
  const rendered = renderWithQueryClientAndMemoryRouter(<OsFilterDrawer />, routes, {
    initialEntries: [
      {
        pathname: "/dashboard",
        search: `code=${code}&os=${queryString}`,
      },
    ],
  });
  return {
    user,
    ...rendered,
  };
};

describe("OsFilterDrawer", () => {
  describe("SPA Filters", () => {
    it("should display the drawer closed initially", () => {
      setup([], "spas");
      expect(screen.getByRole("button", { name: "Filters" }).getAttribute("data-state")).toEqual(
        "closed",
      );
    });
    it("should open the drawer and show all the filters, if you click the Filter button", async () => {
      const { user } = setup([], "spas");
      await user.click(screen.getByRole("button", { name: "Filters" }));
      expect(screen.getByRole("heading", { name: "Filters", level: 4 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reset" })).toBeInTheDocument();

      [
        "State",
        "Authority",
        "Status",
        "RAI Withdraw Enabled",
        "Initial Submission",
        "Final Disposition",
        "Latest Package Activity",
        "Formal RAI Response",
        "CPOC Name",
        "Submission Source",
      ].forEach((label) => {
        const heading = screen.queryByRole("heading", { name: label, level: 3 });
        expect(heading).toBeInTheDocument();
        expect(heading.nextElementSibling.getAttribute("data-state")).toEqual("closed");
      });
    });
    describe("State filter", () => {
      it("should handle clicking the State filter", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const state = screen.getByRole("heading", {
          name: "State",
          level: 3,
        }).parentElement;
        expect(state.getAttribute("data-state")).toEqual("closed");
        await user.click(screen.getByRole("button", { name: "State" }));
        expect(state.getAttribute("data-state")).toEqual("open");
        screen.debug(state);
        const combo = screen.getByRole("combobox");
        expect(combo).toBeInTheDocument();
      });
      it("should display a state filter if one is selected", async () => {
        const { user } = setup(
          [
            {
              label: "State",
              field: "state.keyword",
              component: "multiSelect",
              prefix: "must",
              type: "terms",
              value: ["MD"],
            },
          ],
          "spas",
        );
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const state = screen.getByRole("heading", {
          name: "State",
          level: 3,
        }).parentElement;
        expect(state.getAttribute("data-state")).toEqual("open");
        screen.debug(state);

        const combo = screen.getByRole("combobox");
        expect(combo).toBeInTheDocument();
        expect(screen.queryByLabelText("Remove MD")).toBeInTheDocument();
      });
    });
    describe("Authority filter", () => {
      it("should handle clicking the Authority filter", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const authority = screen.getByRole("heading", {
          name: "Authority",
          level: 3,
        }).parentElement;
        expect(authority.getAttribute("data-state")).toEqual("closed");
        await user.click(screen.getByRole("button", { name: "Authority" }));
        expect(authority.getAttribute("data-state")).toEqual("open");
        expect(screen.queryByRole("button", { name: "Select All" })).toBeVisible();
        expect(screen.queryByRole("button", { name: "Clear" }));

        const chip = screen.queryByLabelText("CHIP SPA");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("unchecked");

        const med = screen.queryByLabelText("Medicaid SPA");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");
      });
      it("should display spa filter authorities if one filter is selected", async () => {
        const { user } = setup(
          [
            {
              label: "Authority",
              field: "authority.keyword",
              component: "multiCheck",
              prefix: "must",
              type: "terms",
              value: ["CHIP SPA"],
            },
          ],
          "spas",
        );
        await user.click(screen.getByRole("button", { name: "Filters" }));

        // it should already be expanded if there is a filter already set
        expect(
          screen
            .getByRole("heading", {
              name: "Authority",
              level: 3,
            })
            .parentElement.getAttribute("data-state"),
        ).toEqual("open");

        const chip = screen.queryByLabelText("CHIP SPA");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("checked");

        const med = screen.queryByLabelText("Medicaid SPA");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");
      });
    });
  });
  describe("Waiver Filters", () => {
    it("should display the drawer closed initially", () => {
      setup([], "waivers");
      expect(screen.getByRole("button", { name: "Filters" }).getAttribute("data-state")).toEqual(
        "closed",
      );
    });
    it("should open the drawer and show all the filters, if you click the Filter button", async () => {
      const { user } = setup([], "waivers");
      await user.click(screen.getByRole("button", { name: "Filters" }));
      expect(screen.getByRole("heading", { name: "Filters", level: 4 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reset" })).toBeInTheDocument();

      [
        "State",
        "Authority",
        "Action Type",
        "Status",
        "RAI Withdraw Enabled",
        "Initial Submission",
        "Final Disposition",
        "Latest Package Activity",
        "Formal RAI Response",
        "CPOC Name",
        "Submission Source",
      ].forEach((label) => {
        const heading = screen.queryByRole("heading", { name: label, level: 3 });
        expect(heading).toBeInTheDocument();
        expect(heading.nextElementSibling.getAttribute("data-state")).toEqual("closed");
      });
    });
    describe("Authority filter", () => {
      it("should handle clicking the Authority filter", async () => {
        const { user } = setup([], "waivers");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const authority = screen.getByRole("heading", {
          name: "Authority",
          level: 3,
        }).parentElement;
        expect(authority.getAttribute("data-state")).toEqual("closed");
        await user.click(screen.getByRole("button", { name: "Authority" }));
        expect(authority.getAttribute("data-state")).toEqual("open");
        expect(screen.queryByRole("button", { name: "Select All" })).toBeVisible();
        expect(screen.queryByRole("button", { name: "Clear" }));

        const chip = screen.queryByLabelText("1915(b)");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("unchecked");

        const med = screen.queryByLabelText("1915(c)");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");
      });
      it("should display waivers filter authorities if one filter is selected", async () => {
        const { user } = setup(
          [
            {
              label: "Authority",
              field: "authority.keyword",
              component: "multiCheck",
              prefix: "must",
              type: "terms",
              value: ["1915(b)"],
            },
          ],
          "waivers",
        );
        await user.click(screen.getByRole("button", { name: "Filters" }));

        // it should already be expanded if there is a filter already set
        expect(
          screen
            .getByRole("heading", {
              name: "Authority",
              level: 3,
            })
            .parentElement.getAttribute("data-state"),
        ).toEqual("open");

        const chip = screen.queryByLabelText("1915(b)");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("checked");

        const med = screen.queryByLabelText("1915(c)");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");
      });
    });
  });
  it("should show for filters for an invalid tab", async () => {
    // @ts-expect-error
    const { user } = setup([], "invalid");
    await user.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getAllByRole("button").length).toEqual(2);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
