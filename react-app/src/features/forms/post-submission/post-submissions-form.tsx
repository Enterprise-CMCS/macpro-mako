import { useParams } from "react-router-dom";
import { WithdrawRaiForm } from "./withdraw-rai";

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<string, () => React.ReactNode> = {
  "withdraw-rai": WithdrawRaiForm,
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type } = useParams();
  const PostSubmissionForm = postSubmissionForms[type];

  return <PostSubmissionForm />;
};
