import { RouteObject } from "react-router-dom";
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
import { ActionWrapper } from "./ActionWrapper";

export const packageActionRoutes: RouteObject = {
  path: "/action/waiver/:id",
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
      path: "enable-rai-response-withdraw",
      element: <ToggleRaiResponseWithdraw isEnabled />,
      action: toggleRaiWithdrawSubmission,
    },
    {
      path: "disable-rai-response-withdraw",
      element: <ToggleRaiResponseWithdraw isEnabled={false} />,
      action: toggleRaiWithdrawSubmission,
    },
    {
      path: "withdraw-package",
      element: <WithdrawPackage />,
      action: withdrawPackageSubmission,
    },
  ],
};

export * from "./ActionWrapper";
