import * as C from "@/components";
import { TimeoutModal } from "@/components";
import * as F from "@/features";
import {
  postSubmissionLoader,
  PostSubmissionWrapper,
} from "@/features/forms/post-submission/post-submission-forms";
import { QueryClient } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
export const queryClient = new QueryClient();
export const FAQ_TAB = "faq-tab";

// These routes are divided into public and private, but this distinction
// is not used for enforcing authentication. Instead, private routes include
// a Timeout component that logs out a user after a period of inactivity.

const PrivateWrapper = ({ element: Component }) => {
  return (
    <>
      <TimeoutModal />
      {Component}
    </>
  );
};

const publicRoutes = [
  { path: "/", index: true, element: <F.Welcome /> },
  { path: "/faq", element: <F.Faq /> },
  { path: "/faq/:id", element: <F.Faq /> },
  { path: "/webforms", element: <F.WebformsList /> },
  { path: "/webform/:id/:version", element: <F.Webform /> },
];

const privateRoutes = [
  {
    path: "/dashboard",
    element: <PrivateWrapper element={<F.Dashboard />} />,
    loader: F.dashboardLoader(queryClient),
  },
  {
    path: "/details/:authority/:id",
    element: <F.Details />,
    loader: F.packageDetailsLoader,
  },
  {
    path: "/new-submission/spa/medicaid/create",
    element: <PrivateWrapper element={<F.MedicaidForm />} />,
  },
  {
    path: "/new-submission/spa/chip/create",
    element: <PrivateWrapper element={<F.ChipForm />} />,
  },
  {
    path: "/new-submission/waiver/b/capitated/amendment/create",
    element: <PrivateWrapper element={<F.CapitatedWaivers.AmendmentForm />} />,
  },
  {
    path: "/new-submission/waiver/b/capitated/initial/create",
    element: <PrivateWrapper element={<F.CapitatedWaivers.InitialForm />} />,
  },
  {
    path: "/new-submission/waiver/b/capitated/renewal/create",
    element: <PrivateWrapper element={<F.CapitatedWaivers.Renewal />} />,
  },
  {
    path: "/new-submission/waiver/b/b4/renewal/create",
    element: <PrivateWrapper element={<F.ContractingWaivers.RenewalForm />} />,
  },
  {
    path: "/new-submission/waiver/b/b4/initial/create",
    element: <PrivateWrapper element={<F.ContractingWaivers.InitialForm />} />,
  },
  {
    path: "/new-submission/waiver/b/b4/amendment/create",
    element: <PrivateWrapper element={<F.ContractingWaivers.AmendmentForm />} />,
  },
  {
    path: "/new-submission/waiver/app-k",
    element: <PrivateWrapper element={<F.AppKAmendmentForm />} />,
  },
  {
    path: "/new-submission/waiver/temporary-extensions",
    element: <PrivateWrapper element={<F.TemporaryExtensionForm />} />,
  },
  {
    path: "/new-submission",
    element: <PrivateWrapper element={<F.NewSubmissionInitialOptions />} />,
  },
  {
    path: "/new-submission/spa",
    element: <PrivateWrapper element={<F.SPASubmissionOptions />} />,
  },
  {
    path: "/new-submission/waiver",
    element: <PrivateWrapper element={<F.WaiverSubmissionOptions />} />,
  },
  {
    path: "/new-submission/waiver/b",
    element: <PrivateWrapper element={<F.BWaiverSubmissionOptions />} />,
  },
  {
    path: "/new-submission/waiver/b/b4",
    element: <PrivateWrapper element={<F.B4WaiverSubmissionOptions />} />,
  },
  {
    path: "/new-submission/waiver/b/capitated",
    element: <PrivateWrapper element={<F.BCapWaiverSubmissionOptions />} />,
  },
  {
    path: "/new-submission/spa/medicaid",
    element: <PrivateWrapper element={<F.MedicaidSPASubmissionOptions />} />,
  },
  {
    path: "/new-submission/spa/chip",
    element: <PrivateWrapper element={<F.ChipSPASubmissionOptions />} />,
  },
  {
    path: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
    element: <PrivateWrapper element={<F.MedicaidEligibilityLandingPage />} />,
  },

  { path: "/profile", element: <PrivateWrapper element={<F.Profile />} /> },
  { path: "/guides/abp", element: <PrivateWrapper element={<F.ABPGuide />} /> },
  {
    path: "/actions/:type/:authority/:id",
    element: <PrivateWrapper element={<PostSubmissionWrapper />} />,
    loader: postSubmissionLoader,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <C.Layout />,
    children: [...privateRoutes, ...publicRoutes],
    loader: F.loader(queryClient),
    HydrateFallback: () => null,
  },
]);
