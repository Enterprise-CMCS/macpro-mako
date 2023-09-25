import { createBrowserRouter } from "react-router-dom";
import * as P from "@/pages";
import { loader as rootLoader } from "@/pages/welcome";
import { dashboardLoader } from "@/pages/dashboard";
import "@/api/amplifyConfig";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";

/** TODO: Implement enum values where `to` or `href` is currently just a string. */
export enum ROUTES {
  HOME = "/",
  DASHBOARD = "/dashboard",
  DETAILS = "/details",
  FAQ = "/faq",
  NEW_SUBMISSION = "/create",
}
export const queryClient = new QueryClient();

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <C.Layout />,
    children: [
      { path: ROUTES.HOME, index: true, element: <P.Welcome /> },
      {
        path: ROUTES.DASHBOARD,
        element: <P.Dashboard />,
        loader: dashboardLoader(queryClient),
      },
      { path: ROUTES.DETAILS, element: <P.Details /> },
      { path: ROUTES.FAQ, element: <P.Faq /> },
      { path: ROUTES.NEW_SUBMISSION, element: <P.NewSubmissionOptions /> },
      { path: "/form", element: <P.ExampleForm /> },
    ],
    loader: rootLoader(queryClient),
  },
]);
