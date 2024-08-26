import { ReactNode } from "react";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, beforeAll, vi } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from ".";
import { OsExportData, useOsUrl } from "../Opensearch";
import { Dashboard, dashboardLoader } from "@/features";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

// const wrapper = ({ children }: { children: ReactNode }) => (
//   <MemoryRouter initialEntries={["/dashboard"]}>
//     <Routes>
//       <Route
//         path="/dashboard"
//         element={<Dashboard />}
//       />
//     </Routes>
//     {children}
//   </MemoryRouter>
// );

// const renderWithClient = (ui: ReactJSXElement) => {
//   const queryClient = new QueryClient();

//   return {
//     ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
//     queryClient,
//   };
// }

// const testing = <MemoryRouter initialEntries={["/dashboard"]}>
// <Routes>
//   <Route path="/dashboard" element={<Dashboard/>}/>
// </Routes>
// </MemoryRouter>

// vi.mock("../Opensearch/main/useOpensearch.ts", () => ({
//   useOsUrl: vi.fn().mockResolvedValue({
//     state: {
//       filters: [],
//       search: "",
//       tab: "spas",
//       pagination: {
//         number: 0,
//         size: 25,
//       },
//       sort: {
//         field: "submissionDate",
//         order: "desc",
//       },
//     },
//     queryString: "randomstring",
//   }),
// }));
vi.mock("../Opensearch/main/useOpensearch.ts", () => ({
  useOsUrl: vi.fn(),
}))

describe("Tooltip Component", () => {
  test("Tooltip content hidden when not hovering", async () => {
    // useOsUrl.mockReturnValue({
    //   state: {
    //     filters: [],
    //     search: "",
    //     tab: "spas",
    //     pagination: {
    //       number: 0,
    //       size: 25,
    //     },
    //     sort: {
    //       field: "submissionDate",
    //       order: "desc",
    //     },
    //   },
    //   queryString: "randomstring",
    // })
    vi.mock("../Opensearch/main/useOpensearch.ts", () => ({
      useOsUrl: vi.fn().mockReturnValue({
        state: {
          filters: [],
          search: "",
          tab: "spas",
          pagination: {
            number: 0,
            size: 25,
          },
          sort: {
            field: "submissionDate",
            order: "desc",
          },
        },
        queryString: "randomstring",
      }),
    }));
    
    const { getByText } = render(<OsExportData columns={[]} />);
    expect(getByText("SPAs")).toBeInTheDocument()
    // screen.findByText("SPAs")
    // expect(screen.getByText("SPAs")).toBeInTheDocument();
    // render(<Dashboard/>)
    // const tooltipTrigger = screen.getByText("SPAs");
    // expect(tooltipTrigger).toBeInTheDocument();
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
