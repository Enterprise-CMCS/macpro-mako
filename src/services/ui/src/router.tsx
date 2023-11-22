import { createBrowserRouter } from "react-router-dom";
import * as P from "@/pages";
import { loader as rootLoader } from "@/pages/welcome";
import { dashboardLoader } from "@/pages/dashboard";
import "@/api/amplifyConfig";
import * as C from "@/components";
import { QueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/routes";
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
      {
        path: ROUTES.NEW_SUBMISSION_OPTIONS,
        element: <P.NewSubmissionInitialOptions />,
      },
      {
        path: ROUTES.SPA_SUBMISSION_OPTIONS,
        element: <P.SPASubmissionOptions />,
      },
      {
        path: ROUTES.WAIVER_SUBMISSION_OPTIONS,
        element: <P.WaiverSubmissionOptions />,
      },
      {
        path: ROUTES.B_WAIVER_SUBMISSION_OPTIONS,
        element: <P.BWaiverSubmissionOptions />,
      },
      {
        path: ROUTES.B4_WAIVER_OPTIONS,
        element: <P.B4WaiverSubmissionOptions />,
      },
      {
        path: ROUTES.BCAP_WAIVER_OPTIONS,
        element: <P.BCapWaiverSubmissionOptions />,
      },
      {
        path: ROUTES.MEDICAID_SPA_SUB_OPTIONS,
        element: <P.MedicaidSPASubmissionOptions />,
      },
      {
        path: ROUTES.CHIP_SPA_SUB_OPTIONS,
        element: <P.ChipSPASubmissionOptions />,
      },
      {
        path: ROUTES.MEDICAID_ABP_LANDING,
        element: <P.MedicaidABPLandingPage />,
      },
      {
        path: ROUTES.MEDICAID_ELIGIBILITY_LANDING,
        element: <P.MedicaidEligibilityLandingPage />,
      },
      {
        path: ROUTES.CHIP_ELIGIBILITY_LANDING,
        element: <P.CHIPEligibilityLandingPage />,
      },
      { path: ROUTES.MEDICAID_NEW, element: <P.MedicaidForm /> },
      { path: ROUTES.ACTION, element: <P.ActionFormIndex /> },
      { path: ROUTES.WEBFORMS, element: <C.Webforms /> },
      { path: ROUTES.WEBFORM, element: <C.Webform /> },
    ],
    loader: rootLoader(queryClient),
  },
]);
