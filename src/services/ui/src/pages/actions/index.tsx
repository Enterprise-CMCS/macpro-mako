import { Navigate, useParams } from "@/components/Routing";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { RaiIssue } from "@/pages/actions/IssueRai";
import { WithdrawPackage } from "@/pages/actions/WithdrawPackage";
import { RespondToRai } from "@/pages/actions/RespondToRai";
import { Action } from "shared-types";
import { WithdrawRai } from "./WithdrawRai";

export const ActionFormIndex = () => {
  const { type } = useParams("/action/:id/:type");
  switch (type) {
    case Action.WITHDRAW_PACKAGE:
      return <WithdrawPackage />;
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw />;
    case Action.ISSUE_RAI:
      return <RaiIssue />;
    case Action.WITHDRAW_RAI:
      return <WithdrawRai />;
    case Action.RESPOND_TO_RAI:
      return <RespondToRai />;
    default:
      return <Navigate path="/" />;
  }
};
