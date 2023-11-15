import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { IssueRai } from "@/pages/actions/IssueRai";
import { WithdrawPackage } from "@/pages/actions/WithdrawPackage";
import { Action } from "shared-types";

export const ActionFormIndex = () => {
  const { type } = useParams<{ type: Action }>();
  switch (type) {
    case Action.WITHDRAW_PACKAGE:
      return <WithdrawPackage />;
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw />;
    case Action.ISSUE_RAI:
      return <IssueRai />;
    default:
      return <Navigate to={ROUTES.HOME} />;
  }
};
