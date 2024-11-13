import { LoaderFunction, useParams } from "react-router-dom";
import {
  WithdrawPackageAction,
  WithdrawPackageActionChip,
  WithdrawPackageActionWaiver,
} from "./withdraw-package";
import { RespondToRaiChip, RespondToRaiMedicaid, RespondToRaiWaiver } from "./respond-to-rai";
import { queryClient } from "../../../router";
import { getItem } from "@/api";
import { WithdrawRaiForm } from "./withdraw-rai";
import { DisableWithdrawRaiForm, EnableWithdrawRaiForm } from "./toggle-withdraw-rai";
import { Amendment } from "./amend";

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<string, Record<string, () => React.ReactNode>> = {
  "withdraw-package": {
    ["1915(b)"]: WithdrawPackageActionWaiver,
    ["1915(c)"]: WithdrawPackageActionWaiver,
    ["Medicaid SPA"]: WithdrawPackageAction,
    ["CHIP SPA"]: WithdrawPackageActionChip,
  },
  "respond-to-rai": {
    ["1915(b)"]: RespondToRaiWaiver,
    ["1915(c)"]: RespondToRaiWaiver,
    ["Medicaid SPA"]: RespondToRaiMedicaid,
    ["CHIP SPA"]: RespondToRaiChip,
  },
  "withdraw-rai": {
    ["1915(b)"]: WithdrawRaiForm,
    ["1915(c)"]: WithdrawRaiForm,
    ["Medicaid SPA"]: WithdrawRaiForm,
    ["CHIP SPA"]: WithdrawRaiForm,
  },
  "enable-rai-withdraw": {
    ["1915(b)"]: EnableWithdrawRaiForm,
    ["1915(c)"]: EnableWithdrawRaiForm,
    ["Medicaid SPA"]: EnableWithdrawRaiForm,
    ["CHIP SPA"]: EnableWithdrawRaiForm,
  },
  "disable-rai-withdraw": {
    ["1915(b)"]: DisableWithdrawRaiForm,
    ["1915(c)"]: DisableWithdrawRaiForm,
    ["Medicaid SPA"]: DisableWithdrawRaiForm,
    ["CHIP SPA"]: DisableWithdrawRaiForm,
  },
  "amend-waiver": {
    ["1915(b)"]: Amendment,
  },
};

export const PostSubmissionWrapper = () => {
  const { type, authority } = useParams();
  const PostSubmissionForm = postSubmissionForms[type][authority];

  return <PostSubmissionForm />;
};

export const postSubmissionLoader: LoaderFunction = async ({ params }) => {
  return await queryClient.fetchQuery({
    queryKey: ["record", params.id],
    queryFn: async () => getItem(params.id),
  });
};
