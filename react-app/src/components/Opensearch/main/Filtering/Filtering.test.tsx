import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, beforeEach } from "vitest";
import { type OsTableColumn, VisibilityPopover } from "../index";

const MockOsFilteringWrapper = () => {
  const [columns, setColumns] = useState<OsTableColumn[]>([
    {
      field: "state.keyword",
      label: "State",
      cell: () => "",
    },
    {
      field: "authority.keyword",
      label: "Authority",
      cell: () => "",
    },
    {
      field: "stateStatus.keyword",
      label: "Status",
      hidden: true,
      cell: () => "",
    },
  ]);

  const onToggle = (field: string) => {
    setColumns((state) => {
      return state?.map((S) => {
        if (S.field !== field) return S;
        return { ...S, hidden: !S.hidden };
      });
    });
  };

  return (
    <VisibilityPopover
      list={columns.filter((COL) => !COL.locked || COL.field)}
      onItemClick={onToggle}
      hiddenColumns={columns.filter((COL) => COL.hidden === true)}
    />
  );
};

describe("Visibility button", () => {
  beforeEach(() => {
    render(<MockOsFilteringWrapper />);
  });

  test("Visibility button should show number of hidden columns if any", async () => {
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Columns (1 hidden)"));

    const stateColumnMenuItem = screen.getByText("State");
    await userEvent.click(stateColumnMenuItem);

    expect(screen.getByText("Columns (2 hidden)")).toBeInTheDocument();
  });

  test("Visibility button text should not show number if no hidden columns", async () => {
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Columns (1 hidden)"));

    const statusColumnMenuItem = screen.getByText("Status");
    await userEvent.click(statusColumnMenuItem);

    expect(screen.getByText("Columns")).toBeInTheDocument();
  });
});
