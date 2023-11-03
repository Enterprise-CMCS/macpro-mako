import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { EnableRaiResponseWithdraw } from "@/pages/actions/EnableRaiResponseWithdraw";
import { Action } from "shared-types";

export const ActionFormIndex = () => {
  const { type } = useParams<{ type: Action }>();
  switch (type) {
    case Action.ENABLE_RAI_WITHDRAW:
      return <EnableRaiResponseWithdraw />;
    default:
      // TODO: Better error communication instead of navigate?
      //  "Hey, this action doesn't exist. Click to go back to the Dashboard."
      return <Navigate to={ROUTES.HOME} />;
  }
};
