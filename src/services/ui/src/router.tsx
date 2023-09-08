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
      { path: "/details", element: <P.Details /> },
      { path: "/faq", element: <P.Faq /> },
      { path: "/authority", element: <P.Authority /> },
      { path: "/create/:authority", element: <P.Create /> },
    ],
    loader: rootLoader(queryClient),
  },
]);
