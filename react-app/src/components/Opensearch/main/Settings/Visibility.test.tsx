import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { VisibilityPopover } from "./Visibility";
import { useSpaTableColumns } from "@/features/dashboard/Lists/spas/consts";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/Opensearch/main/index.tsx", () => ({
  onToggle: vi.fn()
  // .mockReturnValue([{
  //     field: "state.keyword",
  //     label: "State",
  //   },
  //   {
  //     field: "authority.keyword",
  //     label: "Authority",
  //     hidden: true
  //   },
  //   {
  //     field: "stateStatus.keyword",
  //     label: "Status",
  //     hidden: true
  //   }]),
}));

vi.mock("@/features/dashboard/Lists/spas/consts.tsx", () => ({
  useSpaTableColumns: vi.fn().mockReturnValue([
    {
      field: "state.keyword",
      label: "State",
    },
    {
      field: "authority.keyword",
      label: "Authority",
    },
    {
      field: "stateStatus.keyword",
      label: "Status",
      hidden: true
    },
  ]),
}));
describe("Visibility button", () => {
  beforeEach(() => {
    render(
      <VisibilityPopover
        list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
        onItemClick={vi.fn()}
        hiddenColumns={useSpaTableColumns().filter((COL) => COL.hidden === true)}
      />,
    );
  });

  test("Visibility button should show number of hidden columns", async () => {
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
  });

  // test("Visibility button functionality", async () => {
  //   await userEvent.click(screen.getByText("Columns (1 hidden)"));
  //   expect(screen.getByText("Authority")).toBeInTheDocument();
  //   await userEvent.click(screen.getByText("Authority"));
  //   expect(screen.getByText("Columns (2 hidden)")).toBeInTheDocument();
  // })
});
