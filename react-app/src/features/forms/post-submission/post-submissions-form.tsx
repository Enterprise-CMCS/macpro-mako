import { useParams } from "react-router-dom";
import { WithdrawRaiForm } from "./withdraw-rai";
import {
  EnableWithdrawRaiForm,
  DisableWithdrawRaiForm,
} from "./toggle-withdraw-rai";

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<
  string,
  Record<string, () => React.ReactNode>
> = {
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
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type, authority } = useParams();
  const PostSubmissionForm = postSubmissionForms[type][authority];

  return <PostSubmissionForm />;
};
