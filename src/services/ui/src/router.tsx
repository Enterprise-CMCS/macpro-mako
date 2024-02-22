import { RouteObject, createBrowserRouter } from "react-router-dom";
import * as F from "@/features";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";
import { type Route } from "./components/Routing/types";

export const queryClient = new QueryClient();

export const router = createBrowserRouter([
  {
    path: "/",
    element: <C.Layout />,
    children: [
      { path: "/", index: true, element: <F.Welcome /> },
      {
        path: "/dashboard",
        element: <F.Dashboard />,
        loader: F.dashboardLoader(queryClient),
      },
      { path: "/details", element: <F.PackageDetails /> },
      { path: "/faq", element: <F.Faq /> },
      {
        path: "/new-submission",
        element: <F.NewSubmissionInitialOptions />,
      },
      {
        path: "/new-submission/spa",
        element: <F.SPASubmissionOptions />,
      },
      {
        path: "/new-submission/waiver",
        element: <F.WaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b",
        element: <F.BWaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b/b4",
        element: <F.B4WaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/waiver/b/capitated",
        element: <F.BCapWaiverSubmissionOptions />,
      },
      {
        path: "/new-submission/spa/medicaid",
        element: <F.MedicaidSPASubmissionOptions />,
      },
      {
        path: "/new-submission/spa/chip",
        element: <F.ChipSPASubmissionOptions />,
      },
      {
        path: "/new-submission/spa/medicaid/landing/medicaid-abp",
        element: <F.MedicaidABPLandingPage />,
      },
      {
        path: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
        element: <F.MedicaidEligibilityLandingPage />,
      },
      {
        path: "/new-submission/spa/chip/landing/chip-eligibility",
        element: <F.CHIPEligibilityLandingPage />,
      },
      {
        path: "/new-submission/waiver/b/capitated/amendment/create",
        element: <F.Capitated1915BWaiverAmendmentPage />,
      },
      {
        path: "/new-submission/waiver/b/capitated/initial/create",
        element: <F.Capitated1915BWaiverInitialPage />,
      },
      {
        path: "/new-submission/waiver/b/capitated/renewal/create",
        element: <F.Capitated1915BWaiverRenewalPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/renewal/create",
        element: <F.Contracting1915BWaiverRenewalPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/initial/create",
        element: <F.Contracting1915BWaiverInitialPage />,
      },
      {
        path: "/new-submission/waiver/b/b4/amendment/create",
        element: <F.Contracting1915BWaiverAmendmentPage />,
      },
      { path: "/new-submission/spa/medicaid/create", element: <F.MedicaidSpaFormPage /> },
      { path: "/new-submission/spa/chip/create", element: <F.ChipSpaFormPage /> },
      { path: "/action/:id/:type", element: <F.ActionFormIndex /> },
      { path: "/webforms", element: <C.Webforms /> },
      { path: "/webform/:id/:version", element: <C.Webform /> },
      { path: "/profile", element: <F.Profile /> },
      { path: "/guides/abp", element: <F.ABPGuide /> },
    ],
    loader: F.loader(queryClient),
  },
] satisfies TypedRouteObject[]);

type TypedRouteObject = RouteObject & {
  path: Route;
};
