import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes";
import { EnableRaiResponseWithdraw } from "@/pages/actions/EnableRaiResponseWithdraw";

export enum ActionForms {
  ENABLE_RAI_WITHDRAW = "enable-rai-withdraw",
}

export const ActionFormIndex = () => {
  const { type } = useParams<{ type: ActionForms }>();
  switch (type) {
    case ActionForms.ENABLE_RAI_WITHDRAW:
      return <EnableRaiResponseWithdraw />;
    default:
      // TODO: Better error communication instead of navigate?
      //  "Hey, this action doesn't exist. Click to go back to the Dashboard."
      return <Navigate to={ROUTES.HOME} />;
  }
};
