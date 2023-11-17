import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { IssueRai } from "@/pages/actions/IssueRai";
import { Action } from "shared-types";

export const ActionFormIndex = () => {
  const { type } = useParams<{ type: Action }>();
  switch (type) {
    case Action.ENABLE_RAI_WITHDRAW:
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw />;
    case Action.ISSUE_RAI:
      return <IssueRai />;
    default:
      // TODO: Better error communication instead of navigate?
      //  "Hey, this action doesn't exist. Click to go back to the Dashboard."
      return <Navigate to={ROUTES.HOME} />;
  }
};
