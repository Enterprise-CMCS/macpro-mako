import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { opensearch } from "shared-types";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChipBool, ChipDate, ChipTerms, FilterChips } from "@/components";
import { DEFAULT_FILTERS, getDashboardQueryString, renderFilterDrawer } from "@/utils/test-helpers";

describe("FilterChips", () => {
  const openDrawer = vi.fn();
  const clearFilter = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("ChipBool", () => {
    it.each([
      [true, "Yes"],
      ["yes", "Yes"],
      [undefined, "No"],
      [null, "No"],
      ["", "No"],
      [false, "No"],
    ])("when value is '%s' it should display %s", (value, expected) => {
      render(
        <ChipBool
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value,
            type: "match",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(screen.getByText("Test:").textContent).toEqual(`Test: ${expected}`);
    });

    it("should not show a label if no label is provided", () => {
      render(
        <ChipBool
          key="test-chip-bool"
          index={1}
          filter={{
            value: true,
            type: "match",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(screen.getByText("Yes").parentElement.textContent).toEqual("Yes");
    });

    it("should handle clicking the close icon", async () => {
      const user = userEvent.setup();
      render(
        <ChipBool
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value: true,
            type: "match",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(screen.getByRole("button"));
      expect(clearFilter).toHaveBeenCalledWith({
        label: "Test",
        value: true,
        type: "match",
        prefix: "must",
        field: "authority.keyword",
      });
    });

    it("should handle clicking the chip", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChipBool
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value: true,
            type: "match",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(container.firstChild as Element);
      expect(openDrawer).toHaveBeenCalled();
    });
  });

  describe("ChipDate", () => {
    it.each([
      [{ gte: "2024-01-01", lte: "2024-03-01" }, "1/1/2024 - 3/1/2024"],
      [{ gte: "2024-01-01" }, "1/1/2024 - 1/1/2024"],
      [{ lte: "2024-03-01" }, "3/1/2024 - 3/1/2024"],
    ])("when value is '%s' it should display %s", (value, expected) => {
      render(
        <ChipDate
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value,
            type: "range",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(screen.getByText(`Test: ${expected}`)).toBeInTheDocument();
    });

    it("should not show a label if no label is provided", () => {
      render(
        <ChipDate
          key="test-chip-bool"
          index={1}
          filter={{
            value: { gte: "2024-01-01", lte: "2024-03-01" },
            type: "range",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(screen.getByText("1/1/2024 - 3/1/2024").parentElement.textContent).toEqual(
        "1/1/2024 - 3/1/2024",
      );
    });

    it("should handle clicking the close icon", async () => {
      const user = userEvent.setup();
      render(
        <ChipDate
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value: { gte: "2024-01-01", lte: "2024-03-01" },
            type: "range",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(screen.getByRole("button"));
      expect(clearFilter).toHaveBeenCalledWith({
        label: "Test",
        value: { gte: "2024-01-01", lte: "2024-03-01" },
        type: "range",
        prefix: "must",
        field: "authority.keyword",
      });
    });

    it("should handle clicking the chip", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChipDate
          key="test-chip-bool"
          index={1}
          filter={{
            label: "Test",
            value: { gte: "2024-01-01", lte: "2024-03-01" },
            type: "range",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(container.firstChild as Element);
      expect(openDrawer).toHaveBeenCalled();
    });
  });

  describe("ChipTerms", () => {
    it.each([
      [
        "multiple terms with labels",
        "Test",
        ["New", "MD"],
        ["Test: Initial", "Test: Maryland, MD"],
      ],
      ["multiple terms without labels", undefined, ["New", "MD"], ["Initial", "Maryland, MD"]],
      ["single term with labels", "Test", ["New"], ["Test: Initial"]],
      ["single term without labels", undefined, ["MD"], ["Maryland, MD"]],
    ])("should display %s", (_, label, value, expected) => {
      render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            label,
            value,
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );

      expected.forEach((val) => {
        expect(screen.getByText(val)).toBeInTheDocument();
      });
    });

    it("should return null if the value is not an array", () => {
      const { container } = render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            value: "New,MD",
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should return null if the value is an empty array", () => {
      const { container } = render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            value: [],
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should handle clicking the close icon", async () => {
      const user = userEvent.setup();
      render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            value: ["New"],
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(screen.getByRole("button"));
      expect(clearFilter).toHaveBeenCalledWith(
        {
          value: ["New"],
          type: "terms",
          prefix: "must",
          field: "authority.keyword",
        },
        0,
      );
    });

    it("should handle clicking the close icon on the second chip", async () => {
      const user = userEvent.setup();
      render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            value: ["New", "MD"],
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(screen.getAllByRole("button")[1]);
      expect(clearFilter).toHaveBeenCalledWith(
        {
          value: ["New", "MD"],
          type: "terms",
          prefix: "must",
          field: "authority.keyword",
        },
        1,
      );
    });

    it("should handle clicking the chip", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ChipTerms
          key="test-chip-bool"
          index={1}
          filter={{
            value: ["MD"],
            type: "terms",
            prefix: "must",
            field: "authority.keyword",
          }}
          openDrawer={openDrawer}
          clearFilter={clearFilter}
        />,
      );
      await user.click(container.firstChild as Element);
      expect(openDrawer).toHaveBeenCalled();
    });
  });

  describe("FilterChips", () => {
    const setup = (filters: opensearch.Filterable<opensearch.main.Field>[]) => {
      const user = userEvent.setup();
      const rendered = renderFilterDrawer(<FilterChips />, getDashboardQueryString({ filters }));
      return {
        user,
        ...rendered,
      };
    };

    it("should display multiple chips", () => {
      setup(DEFAULT_FILTERS);
      expect(screen.getByText("State: Maryland, MD")).toBeInTheDocument();
      expect(screen.getByText("Authority: CHIP SPA")).toBeInTheDocument();
      expect(screen.getByText("RAI Withdraw Enabled:")).toBeInTheDocument();
      expect(screen.getByText("RAI Withdraw Enabled:").textContent).toEqual(
        "RAI Withdraw Enabled: Yes",
      );
      expect(screen.getByText("Final Disposition: 1/1/2025 - 1/1/2025")).toBeInTheDocument();
    });

    it("should display filters with multiple values", () => {
      setup([
        {
          label: "State",
          field: "state.keyword",
          component: "multiSelect",
          prefix: "must",
          type: "terms",
          value: ["MD", "OH"],
        },
      ]);
      expect(screen.getByText("State: Maryland, MD")).toBeInTheDocument();
      expect(screen.getByText("State: Ohio, OH")).toBeInTheDocument();
    });

    it("should display no chips if there are no supported filters", () => {
      const { container } = setup([
        {
          label: "RAI Withdraw Enabled",
          field: "raiWithdrawEnabled",
          component: "boolean",
          prefix: "must",
          type: "exists",
          value: true,
        },
      ]);
      expect(container.childNodes.length).toEqual(1);
      expect(container.firstChild.childNodes.length).toEqual(0);
      expect(screen.queryAllByRole("button")).toEqual([]);
    });

    it("should display no chips if there are filters", () => {
      const { container } = setup([]);
      expect(container.childNodes.length).toEqual(1);
      expect(container.firstChild.childNodes.length).toEqual(0);
      expect(screen.queryAllByRole("button")).toEqual([]);
    });

    it("should handle deleting a chip", async () => {
      const { user } = setup(DEFAULT_FILTERS);
      await user.click(screen.getAllByRole("button")[0]);
      expect(screen.queryByText("State: Maryland, MD")).toBeNull();
      expect(screen.getByText("Authority: CHIP SPA")).toBeInTheDocument();
      expect(screen.getByText("RAI Withdraw Enabled:")).toBeInTheDocument();
      expect(screen.getByText("RAI Withdraw Enabled:").textContent).toEqual(
        "RAI Withdraw Enabled: Yes",
      );
      expect(screen.getByText("Final Disposition: 1/1/2025 - 1/1/2025")).toBeInTheDocument();
    });

    it("should handle deleting a chip when the filter has multiple values", async () => {
      const { user } = setup([
        {
          label: "State",
          field: "state.keyword",
          component: "multiSelect",
          prefix: "must",
          type: "terms",
          value: ["MD", "OH"],
        },
      ]);
      await user.click(screen.getAllByRole("button")[1]);
      expect(screen.getByText("State: Maryland, MD")).toBeInTheDocument();
      expect(screen.queryByText("State: Ohio, OH")).toBeNull();
    });

    it("should handle clearing all", async () => {
      const { user } = setup(DEFAULT_FILTERS);

      await user.click(screen.getByText("Clear All").parentElement);
      expect(screen.queryByText("State: Maryland, MD")).toBeNull();
      expect(screen.queryByText("Authority: CHIP SPA")).toBeNull();
      expect(screen.queryByText("RAI Withdraw Enabled:")).toBeNull();
      expect(screen.queryByText("Final Disposition: 1/1/2025 - 1/1/2025")).toBeNull();
    });
  });
});
