import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { EnableRaiResponseWithdraw } from "@/pages/actions/EnableRaiResponseWithdraw";
import {WithdrawPackage}from '@/pages/actions/WithdrawPackage';
import { Action } from "shared-types";


export const ActionFormIndex = () => {
  const { type } = useParams<{ type: Action }>();
  switch (type) {
    case Action.ENABLE_RAI_WITHDRAW:
      return <EnableRaiResponseWithdraw />;
    case Action.WITHDRAW_PACKGAGES:
      return <WithdrawPackage />;
    default:
      return <Navigate to={ROUTES.HOME} />;
  }
};
