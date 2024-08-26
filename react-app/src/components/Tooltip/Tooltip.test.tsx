import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, beforeAll } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from ".";
import { OsExportData } from "../Opensearch";

// const wrapper = ({ children }: { children: ReactNode }) => (
//   <MemoryRouter initialEntries={["/dashboard"]}>
//     <Routes>
//       <Route
//         path="/dashboard"
//         element={<OsExportData columns={[]}/>}
//       />
//     </Routes>
//     {children}
//   </MemoryRouter>
// );

const renderWithRouter = (element) => (
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path='/dashboard' element={element} />
      </Routes>
    </MemoryRouter>
  )
);

describe("Tooltip Component", async () => {
  beforeAll(() => {
    // const memoryRouter = createMemoryRouter(
    //   [
    //     { path: "/dashboard", element: <OsExportData columns={[]}/> },
    //   ],
    //   {
    //     initialEntries: ["/dashboard"],
    //   },
    // );
    // render(<OsExportData columns={[]}/>)

    // render(<RouterProvider router={memoryRouter} />);
    // render(<OsExportData columns={[]}/>, { wrapper })
  });
    // render(
      // <OsExportData columns={[]}/>
      // <TooltipProvider>
      //   <Tooltip disableHoverableContent={true}>
      //     <TooltipTrigger asChild>
      //       <button data-testid="tooltip-trigger">Test Button</button>
      //     </TooltipTrigger>
      //     <TooltipContent role="tooltip-content">
      //       Test Tooltip Info
      //     </TooltipContent>
      //   </Tooltip>
      // </TooltipProvider>,
    // );
  // });
  test("Tooltip content hidden when not hovering", () => {
    renderWithRouter(<OsExportData columns={[]}/>)
    const tooltipTrigger = screen.getByRole("tooltip-trigger")
    expect(tooltipTrigger).toBeInTheDocument();
    // const tooltipContent = screen.queryByTestId("tooltip-content");
    // expect(tooltipContent).not.toBeInTheDocument();
  });

  // test("Tooltip content shown on hover", async () => {
  //   const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
  //   expect(tooltipTrigger).toBeInTheDocument();

  //   fireEvent.mouseOver(tooltipTrigger);
  //   const tooltipContent = screen.getByRole('tooltip-content', { name: /test tooltip info/i})
  //   // const tooltipContent = screen.queryByTestId("tooltip-content");
  //   expect(tooltipContent).toBeInTheDocument();
  // });
});
