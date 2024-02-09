import { RouteObject, redirect } from "react-router-dom";
import { IssueRai, issueRaiDefaultAction } from "./IssueRai";
import {
  WithdrawRai,
  onValidSubmission as withdrawRaiSubmission,
} from "./WithdrawRai";
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
  ],
};

export * from "./IssueRai";
export * from "./WithdrawRai";
export * from "./ActionWrapper";
