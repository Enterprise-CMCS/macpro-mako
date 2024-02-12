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
  ],
};

export * from "./ActionWrapper";
export {
  IssueRai,
  issueRaiSchema,
  issueRaiDefaultAction as issueRaiSubmission,
} from "./IssueRai";
export {
  WithdrawRai,
  withdrawRaiSchema,
  onValidSubmission as withdrawRaiWithdrawSubmission,
} from "./WithdrawRai";
export {
  ToggleRaiResponseWithdraw,
  toggleRaiResponseWithdrawSchema,
  onValidSubmission as toggleRaiWithdrawSubmission,
} from "./ToggleRaiResponseWithdraw";
