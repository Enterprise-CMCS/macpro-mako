// import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, beforeEach } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from ".";
import { OsExportData } from "../Opensearch";

describe("Tooltip Component", async () => {
  beforeEach(() => {
    const memoryRouter = createMemoryRouter(
      [
        { path: "/dashboard", element: <OsExportData columns={[]}/> },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );

    render(<RouterProvider router={memoryRouter} />);
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
