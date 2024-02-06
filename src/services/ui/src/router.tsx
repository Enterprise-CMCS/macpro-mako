import { RouteObject, createBrowserRouter } from "react-router-dom";
import * as P from "@/pages";
import * as F from "@/pages/form";
import { loader as rootLoader } from "@/pages/welcome";
import { dashboardLoader } from "@/pages/dashboard";
import "@/api/amplifyConfig";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";
import { type Route } from "./components/Routing/types";
export const queryClient = new QueryClient();

const packageActionRoutes: RouteObject[] = [
  {
    path: "issue-rai",
    element: <F.IssueRai />,
    errorElement: <F.IssueRai />,
    action: F.issueRaiDefaultAction,
  },
];

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
      {
        path: "/new-submission",
        element: <P.NewSubmissionInitialOptions />,
      },
      {
        path: "/new-submission/spa",
        element: <P.SPASubmissionOptions />,
      },
      {
        path: "/new-submission/waiver",
        element: <P.WaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b",
        element: <P.BWaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b/b4",
        element: <P.B4WaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b/capitated",
        element: <P.BCapWaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/spa/medicaid",
        element: <P.MedicaidSPASubmissionOptions />,
      },
      {
        path: "/new-submission/spa/chip",
        element: <P.ChipSPASubmissionOptions />,
      },
      {
        path: "/new-submission/spa/medicaid/landing/medicaid-abp",
        element: <P.MedicaidABPLandingPage />,
      },
      {
        path: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
        element: <P.MedicaidEligibilityLandingPage />,
      },
      {
        path: "/new-submission/spa/chip/landing/chip-eligibility",
        element: <P.CHIPEligibilityLandingPage />,
      },
      // {
      //   path: "/new-submission/waiver/b/create",
      //   element: <P.Waiver1915BFormPage />,
      // },
      {
        path: "/new-submission/spa/medicaid/create",
        element: <P.MedicaidSpaFormPage />,
      },
      {
        path: "/new-submission/spa/chip/create",
        element: <P.ChipSpaFormPage />,
      },
      { path: "/action/:id/:type", element: <P.ActionFormIndex /> },
      {
        // this can be dynamic eventually /waiver can become /:type
        // for now not
        path: "/action/waiver/:id",
        element: <P.ActionWrapper />,
        children: packageActionRoutes,
        // we will also add a loader to this path
        // this will help with managing permissions and re-routing if need be
      },
      { path: "/webforms", element: <C.Webforms /> },
      { path: "/webform/:id/:version", element: <C.Webform /> },
      { path: "/profile", element: <P.Profile /> },
      { path: "/guides/abp", element: <P.ABPGuide /> },
    ] satisfies TypedRouteObject[],
    loader: rootLoader(queryClient),
  },
] satisfies TypedRouteObject[]);

type TypedRouteObject = RouteObject & {
  path: Route;
};
