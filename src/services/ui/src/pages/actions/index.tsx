import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { IssueRai } from "@/pages/actions/IssueRai";
import { WithdrawPackage } from "@/pages/actions/WithdrawPackage";
import { RespondToRai } from "@/pages/actions/RespondToRai";
import { Action } from "shared-types";
import { WithdrawRai } from "./WithdrawRai";

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
    case Action.WITHDRAW_RAI:
      return <WithdrawRai />;
    case Action.RESPOND_TO_RAI:
      return <RespondToRai />;
    default:
      return <Navigate to={ROUTES.HOME} />;
  }
};
