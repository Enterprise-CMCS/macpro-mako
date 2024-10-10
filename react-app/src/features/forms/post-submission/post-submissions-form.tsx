import { useParams } from "react-router-dom";
import { WithdrawRaiForm } from "./withdraw-rai";

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
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type, authority } = useParams();
  const PostSubmissionForm = postSubmissionForms[type][authority];

  return <PostSubmissionForm />;
};
