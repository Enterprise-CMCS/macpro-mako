import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VisibilityPopover } from "@/components";
import { BLANK_VALUE } from "@/consts";

describe("VisibilityPopover", () => {
  it("should display the number of hidden columns", () => {
    render(
      <VisibilityPopover
        list={[
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
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
        onItemClick={vi.fn()}
        hiddenColumns={[
          {
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Columns (1 hidden)" })).toBeInTheDocument();
  });

  it("should display no number if no columns are hidden", () => {
    render(
      <VisibilityPopover
        list={[
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
        ]}
        onItemClick={vi.fn()}
        hiddenColumns={[]}
      />,
    );
    expect(screen.getByRole("button", { name: "Columns" })).toBeInTheDocument();
  });

  it("should should skip columns without field", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <VisibilityPopover
        list={[
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
            label: "Authority",
            transform: (data) => data.authority ?? BLANK_VALUE,
            cell: (data) => data.authority ?? BLANK_VALUE,
          },
          {
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
        onItemClick={onItemClick}
        hiddenColumns={[
          {
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Columns (1 hidden)" }));

    expect(within(screen.getByRole("dialog")).queryByText("Authority")).toBeNull();
  });

  it("should handle hiding a column", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <VisibilityPopover
        list={[
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
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
        onItemClick={onItemClick}
        hiddenColumns={[
          {
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Columns (1 hidden)" }));

    const stateColumnMenuItem = within(screen.getByRole("dialog")).getByText("State");
    await user.click(stateColumnMenuItem.parentElement);

    expect(onItemClick).toHaveBeenCalledWith("state.keyword");
  });

  it("should handle unhiding a column", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <VisibilityPopover
        list={[
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
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
        onItemClick={onItemClick}
        hiddenColumns={[
          {
            field: "finalDispositionDate.keyword",
            label: "Final Disposition",
            hidden: true,
            transform: (data) => data.finalDispositionDate ?? BLANK_VALUE,
            cell: (data) => data.finalDispositionDate ?? BLANK_VALUE,
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Columns (1 hidden)" }));

    const stateColumnMenuItem = within(screen.getByRole("dialog")).getByText("Final Disposition");
    await user.click(stateColumnMenuItem.parentElement);

    expect(onItemClick).toHaveBeenCalledWith("finalDispositionDate.keyword");
  });
});
