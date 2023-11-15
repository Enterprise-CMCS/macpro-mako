import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
<<<<<<< HEAD
import { EnableRaiResponseWithdraw } from "@/pages/actions/EnableRaiResponseWithdraw";
import {WithdrawPackage}from '@/pages/actions/WithdrawPackage';
=======
import { ToggleRaiResponseWithdraw } from "@/pages/actions/ToggleRaiResponseWithdraw";
import { IssueRai } from "@/pages/actions/IssueRai";
>>>>>>> master
import { Action } from "shared-types";


export const ActionFormIndex = () => {
  const { type } = useParams<{ type: Action }>();
  switch (type) {
    case Action.ENABLE_RAI_WITHDRAW:
<<<<<<< HEAD
      return <EnableRaiResponseWithdraw />;
    case Action.WITHDRAW_PACKGAGES:
      return <WithdrawPackage />;
=======
    case Action.DISABLE_RAI_WITHDRAW:
      return <ToggleRaiResponseWithdraw />;
    case Action.ISSUE_RAI:
      return <IssueRai />;
>>>>>>> master
    default:
      return <Navigate to={ROUTES.HOME} />;
  }
};
