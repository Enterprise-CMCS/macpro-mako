import { createBrowserRouter } from "react-router-dom";
import * as P from "@/pages";
import { loader as rootLoader } from "@/pages/welcome";
import { dashboardLoader } from "@/pages/dashboard";
import "@/api/amplifyConfig";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const router = createBrowserRouter([
  {
    path: "/",
    element: <C.Layout />,
    children: [
      { path: "/", index: true, element: <P.Welcome /> },
      {
        path: "/dashboard",
        element: <P.Dashboard />,
        loader: dashboardLoader(queryClient),
      },
      { path: "/detail/chip-spa", element: <P.ChipSpaPage /> },
      { path: "/detail/medicaid-spa", element: <P.MedicaidSpaPage /> },
      { path: "/detail/waiver", element: <P.WaiverPage /> },
    ],
    loader: rootLoader(queryClient),
  },
]);
