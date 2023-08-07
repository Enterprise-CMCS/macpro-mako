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
      { path: "/medicaid", element: <P.Medicaid /> },
      { path: "/chip", element: <P.Chip /> },
      { path: "/waiver", element: <P.Waiver /> },
      { path: "/record", element: <P.ViewRecord /> },
      { path: "/faq", element: <P.FAQ /> },
    ],
    loader: rootLoader(queryClient),
  },
]);
