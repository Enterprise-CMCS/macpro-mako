import { useParams } from "react-router-dom";
import { WithdrawPackageAction } from "./withdraw-package";

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<string, () => React.ReactNode> = {
  "withdraw-package": WithdrawPackageAction,
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type } = useParams();
  const PostSubmissionForm = postSubmissionForms[type];

  return <PostSubmissionForm />;
};
