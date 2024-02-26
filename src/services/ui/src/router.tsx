import { RouteObject, createBrowserRouter } from "react-router-dom";
import * as P from "@/pages";
import { loader as rootLoader } from "@/pages/welcome";
import { dashboardLoader } from "@/pages/dashboard";
import "@/api/amplifyConfig";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";
import { type Route } from "./components/Routing/types";

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
      {
        path: "/new-submission/waiver/b/capitated/amendment/create",
        element: <P.Capitated1915BWaiverAmendmentPage />,
      },
      {
        path: "/new-submission/waiver/b/capitated/initial/create",
        element: <P.Capitated1915BWaiverInitialPage />,
      },
      {
        path: "/new-submission/waiver/b/capitated/renewal/create",
        element: <P.Capitated1915BWaiverRenewalPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/renewal/create",
        element: <P.Contracting1915BWaiverRenewalPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/initial/create",
        element: <P.Contracting1915BWaiverInitialPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/amendment/create",
        element: <P.Contracting1915BWaiverAmendmentPage />,
      },
      { path: "/new-submission/spa/medicaid/create", element: <P.MedicaidSpaFormPage /> },
      { path: "/new-submission/spa/chip/create", element: <P.ChipSpaFormPage /> },
      { path: "/action/:id/:type", element: <P.ActionFormIndex /> },
      { path: "/webforms", element: <C.Webforms /> },
      { path: "/webform/:id/:version", element: <C.Webform /> },
      { path: "/profile", element: <P.Profile /> },
      { path: "/guides/abp", element: <P.ABPGuide /> },
      { path: "/new-submission/app-k", element: <P.AppKSubmissionForm /> },
    ],
    loader: rootLoader(queryClient),
  },
] satisfies TypedRouteObject[]);

type TypedRouteObject = RouteObject & {
  path: Route;
};
