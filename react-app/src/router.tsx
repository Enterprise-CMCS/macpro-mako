import { createBrowserRouter, Navigate, Outlet } from "react-router";

import * as C from "@/components";
import { TimeoutModal, UserManagementGuard } from "@/components";
import * as F from "@/features";
import {
  postSubmissionLoader,
  PostSubmissionWrapper,
} from "@/features/forms/post-submission/post-submission-forms";
import { userProfileLoader } from "@/features/profile/user";
import { SignUp } from "@/features/sign-up/sign-up";
import { queryClient } from "@/utils";

import { CMSSignup, StateConfirmation, StateRoleSignup, StateSignup } from "./features/sign-up";

const RoutesWithTimeout = () => (
  <>
    <TimeoutModal />
    <Outlet />
  </>
);

export const router = (loginFlag = false) => {
  return createBrowserRouter([
    {
      path: "/",
      element: (
        // For tracking user_role sent with GA events
        <C.Layout />
      ),
      errorElement: <C.Layout />,
      children: [
        { path: "/", index: true, element: <F.WelcomeWrapper /> },
        { path: "/faq", element: <F.Faq /> },
        { path: "/faq/:id", element: <F.Faq /> },
        { path: "/latestupdates", element: <F.LatestUpdates /> },
        { path: "/webforms", element: <F.WebformsList /> },
        { path: "/webform/:id/:version", element: <F.Webform /> },
        {
          path: "/login",
          element: <>{loginFlag ? <Navigate to={"/"} /> : <F.Login />}</>,
        },
        {
          element: <RoutesWithTimeout />,
          children: [
            {
              path: "/signup",
              element: <SignUp />,
            },
            { path: "/signup/state", element: <StateSignup /> },
            { path: "/signup/state/role", element: <StateRoleSignup /> },
            { path: "/signup/state/role/confirm", element: <StateConfirmation /> },
            { path: "/signup/cms", element: <CMSSignup /> },
            {
              path: "/dashboard",
              element: <F.Dashboard />,
              loader: F.dashboardLoader(queryClient, loginFlag),
            },
            {
              path: "/details/:authority/:id",
              element: <F.Details />,
              loader: F.packageDetailsLoader,
            },
            {
              path: "/new-submission/spa/medicaid/create",
              element: <F.MedicaidForm />,
            },
            {
              path: "/new-submission/spa/chip/create",
              element: <F.ChipForm />,
            },
            {
              path: "/new-submission/spa/chip/create/chip-details",
              element: <F.ChipDetailsForm />,
            },
            {
              path: "/new-submission/waiver/b/capitated/amendment/create",
              element: <F.CapitatedWaivers.AmendmentForm />,
            },
            {
              path: "/new-submission/waiver/b/capitated/initial/create",
              element: <F.CapitatedWaivers.InitialForm />,
            },
            {
              path: "/new-submission/waiver/b/capitated/renewal/create",
              element: <F.CapitatedWaivers.Renewal />,
            },
            {
              path: "/new-submission/waiver/b/b4/renewal/create",
              element: <F.ContractingWaivers.RenewalForm />,
            },
            {
              path: "/new-submission/waiver/b/b4/initial/create",
              element: <F.ContractingWaivers.InitialForm />,
            },
            {
              path: "/new-submission/waiver/b/b4/amendment/create",
              element: <F.ContractingWaivers.AmendmentForm />,
            },
            {
              path: "/new-submission/waiver/app-k",
              element: <F.AppKAmendmentForm />,
            },
            {
              path: "/new-submission/waiver/temporary-extensions",
              element: <F.TemporaryExtensionForm />,
            },
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
            { path: "/profile", element: <F.MyProfile /> },
            {
              path: "/profile/:profileId",
              element: <F.UserProfile />,
              loader: userProfileLoader,
            },
            { path: "/guides/abp", element: <F.ABPGuide /> },
            {
              path: "/actions/:type/:authority/:id",
              element: <PostSubmissionWrapper />,
              loader: postSubmissionLoader,
            },
            {
              path: "/support",
              element: <F.SupportPage />,
            },
            {
              path: "/support/:id",
              element: <F.SupportPage />,
            },
            {
              element: <UserManagementGuard />,
              children: [
                {
                  path: "/usermanagement",
                  element: <F.UserManagement />,
                },
              ],
            },
          ],
        },

        { path: "/404", element: <F.ErrorPage /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
      loader: F.loader(queryClient, loginFlag),
      HydrateFallback: () => null,
    },
  ]);
};
