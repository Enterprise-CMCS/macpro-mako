import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { VisibilityPopover } from "./Visibility";
import { useSpaTableColumns } from "@/features/dashboard/Lists/spas/consts";
import userEvent from "@testing-library/user-event";
import { OsMainView } from "..";

// vi.mock("@/components/Opensearch/main/index.tsx", () => ({
//   onToggle: vi.fn()
//   // .mockReturnValue([
//   //   {
//   //     field: "state.keyword",
//   //     label: "State",
//   //   },
//   //   {
//   //     field: "authority.keyword",
//   //     label: "Authority",
//   //     hidden: true,
//   //   },
//   //   {
//   //     field: "stateStatus.keyword",
//   //     label: "Status",
//   //     hidden: true,
//   //   },
//   // ]),
// }));

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
      hidden: true,
    },
  ]),
}));

// const mockOnToggle = (field: string) => {
//   useSpaTableColumns().map((col) => {
//     if (col.field !== field) return col;
//     return { ...col, hidden: !col.hidden };
//   })
// }
describe("Visibility button", () => {
  // beforeEach(() => {
  //   render(
  //     <VisibilityPopover
  //       list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
  //       onItemClick={onToggle}
  //       hiddenColumns={useSpaTableColumns().filter(
  //         (COL) => COL.hidden === true,
  //       )}
  //     />,
  //     // <OsMainView columns={useSpaTableColumns()}/>
  //   );
  // });

  test("Visibility button should show number of hidden columns", async () => {
    const onToggle = vi.fn();
    render(
      <VisibilityPopover
        list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
        onItemClick={onToggle}
        hiddenColumns={useSpaTableColumns().filter(
          (COL) => COL.hidden === true,
        )}
      />,
    );
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
  });

  test("Visibility button functionality", async () => {
    // const onToggle = vi.fn((field) => {
    //   useSpaTableColumns().map((col) => {
    //     if (col.field !== field) return col;
    //     return { ...col, hidden: !col.hidden };
    //   })})
    const onToggle = vi.fn();
    render(
      <VisibilityPopover
        list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
        onItemClick={onToggle}
        hiddenColumns={useSpaTableColumns().filter(
          (COL) => COL.hidden === true,
        )}
      />,
    );
    await userEvent.click(screen.getByText("Columns (1 hidden)"));
    expect(screen.getByText("State")).toBeInTheDocument();

    await userEvent.click(screen.getByText("State"));
    expect(onToggle).toHaveBeenCalledWith("state.keyword")
    // await waitFor(() => screen.getByText("Columns 2 hidden"));
    // expect(screen.getByText("Columns (2 hidden)")).toBeInTheDocument();
  });
});
