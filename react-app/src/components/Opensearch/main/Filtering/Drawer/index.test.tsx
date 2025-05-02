import { screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { opensearch } from "shared-types";
import { describe, expect, it } from "vitest";

import { getDashboardQueryString, renderFilterDrawer } from "@/utils/test-helpers";

import { OsFilterDrawer } from "./index";

const setup = (
  filters: opensearch.Filterable<opensearch.main.Field>[],
  tab: "spas" | "waivers",
) => {
  const user = userEvent.setup();
  const rendered = renderFilterDrawer(
    <OsFilterDrawer />,
    getDashboardQueryString({ filters, tab }),
  );
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
    it("should handle clicking the Filter button and opening the drawer", async () => {
      const { user } = setup([], "spas");
      await user.click(screen.getByRole("button", { name: "Filters" }));
      expect(screen.getByRole("heading", { name: "Filter by", level: 4 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Close" })).toBeInTheDocument();

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
      ].forEach((label) => {
        const heading = screen.queryByRole("heading", { name: label, level: 3 });
        expect(heading).toBeInTheDocument();
        expect(heading.nextElementSibling.getAttribute("data-state")).toEqual("closed");
      });
    });
    it("should handle clicking the Reset button", async () => {
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
        ],
        "spas",
      );
      await user.click(screen.getByRole("button", { name: "Filters" }));
      const state = screen.getByRole("heading", {
        name: "State",
        level: 3,
      }).parentElement;
      expect(state.getAttribute("data-state")).toEqual("open");
      expect(within(state).queryByLabelText("Remove MD")).toBeInTheDocument();

      const authority = screen.getByRole("heading", {
        name: "Authority",
        level: 3,
      }).parentElement;
      expect(authority.getAttribute("data-state")).toEqual("open");
      expect(within(authority).queryByLabelText("CHIP SPA").getAttribute("data-state")).toEqual(
        "checked",
      );

      const raiWithdraw = screen.getByRole("heading", {
        name: "RAI Withdraw Enabled",
        level: 3,
      }).parentElement;
      expect(raiWithdraw.getAttribute("data-state")).toEqual("open");
      expect(within(raiWithdraw).queryByLabelText("Yes").getAttribute("data-state")).toEqual(
        "checked",
      );

      const finalDisposition = screen.getByRole("heading", {
        name: "Final Disposition",
        level: 3,
      }).parentElement;
      expect(finalDisposition.getAttribute("data-state")).toEqual("open");
      expect(
        within(finalDisposition).queryByText("Jan 01, 2025 - Jan 01, 2025"),
      ).toBeInTheDocument();

      await user.click(screen.queryByRole("button", { name: "Clear all filters" }));

      expect(state.getAttribute("data-state")).toEqual("open");
      if (within(state).queryByLabelText("Remove MD")) {
        await waitForElementToBeRemoved(within(state).queryByLabelText("Remove MD"));
      }
      expect(within(state).queryByLabelText("Remove MD")).toBeNull();

      expect(authority.getAttribute("data-state")).toEqual("open");
      expect(within(authority).queryByLabelText("CHIP SPA").getAttribute("data-state")).toEqual(
        "unchecked",
      );

      expect(raiWithdraw.getAttribute("data-state")).toEqual("open");
      expect(within(raiWithdraw).queryByLabelText("Yes").getAttribute("data-state")).toEqual(
        "unchecked",
      );

      expect(finalDisposition.getAttribute("data-state")).toEqual("open");
      expect(within(finalDisposition).queryByText("Pick a date")).toBeInTheDocument();
    });
    it("should handle clicking the Close button", async () => {
      const { user } = setup([], "spas");
      await user.click(screen.getByRole("button", { name: "Filters" }));
      expect(screen.getByRole("heading", { name: "Filter by", level: 4 })).toBeInTheDocument();
      await user.click(screen.queryByRole("button", { name: "Close" }));
      expect(screen.getByRole("button", { name: "Filters" }).getAttribute("data-state")).toEqual(
        "closed",
      );
    });
    describe("State filter", () => {
      it("should handle expanding the State filter", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const state = screen.getByRole("heading", {
          name: "State",
          level: 3,
        }).parentElement;
        expect(state.getAttribute("data-state")).toEqual("closed");
        await user.click(screen.getByRole("button", { name: "State" }));
        expect(state.getAttribute("data-state")).toEqual("open");
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

        const combo = screen.getByRole("combobox");
        expect(combo).toBeInTheDocument();
        expect(screen.queryByLabelText("Remove MD")).toBeInTheDocument();
      });
    });
    describe("Authority filter", () => {
      it("should handle expanding the Authority filter", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const authority = screen.getByRole("heading", {
          name: "Authority",
          level: 3,
        }).parentElement;
        expect(authority.getAttribute("data-state")).toEqual("closed");
        await user.click(screen.getByRole("button", { name: "Authority" }));
        expect(authority.getAttribute("data-state")).toEqual("open");
        expect(screen.queryByRole("button", { name: "Select All" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Clear" })).toBeInTheDocument();

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
      it("should handle selecting a filter", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        await user.click(screen.getByRole("button", { name: "Authority" }));

        const chip = screen.queryByLabelText("CHIP SPA");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("unchecked");

        const med = screen.queryByLabelText("Medicaid SPA");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");

        await user.click(chip);
        expect(chip.getAttribute("data-state")).toEqual("checked");
      });
      it("should handle clicking Select All", async () => {
        const { user } = setup([], "spas");
        await user.click(screen.getByRole("button", { name: "Filters" }));

        await user.click(screen.getByRole("button", { name: "Authority" }));

        const chip = screen.queryByLabelText("CHIP SPA");
        expect(chip).toBeInTheDocument();

        expect(chip.getAttribute("data-state")).toEqual("unchecked");

        const med = screen.queryByLabelText("Medicaid SPA");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("unchecked");

        await user.click(screen.queryByRole("button", { name: "Select All" }));
        expect(chip.getAttribute("data-state")).toEqual("checked");
        expect(med.getAttribute("data-state")).toEqual("checked");
      });
      it("should handle clicking Clear", async () => {
        const { user } = setup(
          [
            {
              label: "Authority",
              field: "authority.keyword",
              component: "multiCheck",
              prefix: "must",
              type: "terms",
              value: ["CHIP SPA", "Medicaid SPA"],
            },
          ],
          "spas",
        );
        await user.click(screen.getByRole("button", { name: "Filters" }));

        const chip = screen.queryByLabelText("CHIP SPA");
        expect(chip).toBeInTheDocument();
        expect(chip.getAttribute("data-state")).toEqual("checked");

        const med = screen.queryByLabelText("Medicaid SPA");
        expect(med).toBeInTheDocument();
        expect(med.getAttribute("data-state")).toEqual("checked");

        await user.click(screen.queryByRole("button", { name: "Clear" }));
        expect(chip.getAttribute("data-state")).toEqual("unchecked");
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
      expect(screen.getByRole("heading", { name: "Filter by", level: 4 })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Clear all filters" })).toBeInTheDocument();

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
    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
