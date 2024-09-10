import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { type OsTableColumn, VisibilityPopover } from "../index";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    <QueryClientProvider client={new QueryClient()}>
      <VisibilityPopover
        list={columns.filter((COL) => !COL.locked || COL.field)}
        onItemClick={onToggle}
        hiddenColumns={columns.filter((COL) => COL.hidden === true)}
      />
    </QueryClientProvider>
  );
};

describe("Visibility button", () => {
  beforeEach(() => {
    render(<MockOsFilteringWrapper />);
  });

  test("Visibility button should show number of hidden columns", async () => {
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
  });

  test("Visibility button functionality", async () => {
    await userEvent.click(screen.getByText("Columns (1 hidden)"));
    expect(screen.getByText("State")).toBeInTheDocument();
    const stateButton = screen.getByText("State");
    await userEvent.click(stateButton);
    console.log(stateButton, "button skadsdlkfsdf");
    await waitFor(() => screen.getByText("Columns 2 hidden"));
  });
});
