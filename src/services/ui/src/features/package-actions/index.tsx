import { Navigate, RouteObject } from "react-router-dom";
import { IssueRai, issueRaiDefaultAction } from "./IssueRai";
import {
  ToggleRaiResponseWithdraw,
  onValidSubmission as toggleRaiWithdrawSubmission,
} from "./ToggleRaiResponseWithdraw";
import {
  WithdrawRai,
  onValidSubmission as withdrawRaiSubmission,
} from "./WithdrawRai";
import {
  WithdrawPackage,
  onValidSubmission as withdrawPackageSubmission,
} from "./WithdrawPackage";
import {
  RespondToRai,
  onValidSubmission as respondToRaiSubmission,
} from "./RespondToRai";
import {
  TemporaryExtension,
  onValidSubmission as temporaryExtensionSubmission,
} from "./TemporaryExtension";
import { ActionWrapper } from "./ActionWrapper";
import { UpdateId, onValidSubmission as updateIdSubmission } from "./UpdateId";
import {
  CompleteIntake,
  onValidSubmission as completeIntakeSubmission,
} from "./CompleteIntake";
import {
  Capitated1915BWaiverAmendmentPage,
  Contracting1915BWaiverAmendmentPage,
} from "@/features";

export const packageActionRoutes: RouteObject = {
  path: "/action/:authority/:id",
  element: <ActionWrapper />,
  children: [
    {
      path: "issue-rai",
      element: <IssueRai />,
      action: issueRaiDefaultAction,
    },
    {
      path: "withdraw-rai",
      element: <WithdrawRai />,
      action: withdrawRaiSubmission,
    },
    {
      path: "enable-rai-withdraw",
      element: <ToggleRaiResponseWithdraw isEnabled />,
      action: toggleRaiWithdrawSubmission,
    },
    {
      path: "disable-rai-withdraw",
      element: <ToggleRaiResponseWithdraw isEnabled={false} />,
      action: toggleRaiWithdrawSubmission,
    },
    {
      path: "withdraw-package",
      element: <WithdrawPackage />,
      action: withdrawPackageSubmission,
    },
    {
      path: "respond-to-rai",
      element: <RespondToRai />,
      action: respondToRaiSubmission,
    },
    {
      path: "1915b-capitated-amendment",
      element: <Capitated1915BWaiverAmendmentPage />,
    },
    {
      path: "1915b-contracting-amendment",
      element: <Contracting1915BWaiverAmendmentPage />,
    },
    {
      path: "temporary-extension",
      element: <TemporaryExtension />,
      action: temporaryExtensionSubmission,
    },
    {
      path: "update-id",
      element: <UpdateId />,
      action: updateIdSubmission,
    },
    {
      path: "complete-intake",
      element: <CompleteIntake />,
      action: completeIntakeSubmission,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ],
};

export * from "./ActionWrapper";
