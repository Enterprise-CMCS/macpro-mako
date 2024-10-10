import { useParams } from "react-router-dom";
import {
  WithdrawPackageAction,
  WithdrawPackageActionChip,
} from "./withdraw-package";

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<
  string,
  Record<string, () => React.ReactNode>
> = {
  "withdraw-package": {
    ["1915(b)"]: WithdrawPackageAction,
    ["1915(c)"]: WithdrawPackageAction,
    ["Medicaid SPA"]: WithdrawPackageAction,
    ["Chip SPA"]: WithdrawPackageActionChip,
  },
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type, authority } = useParams();
  const PostSubmissionForm = postSubmissionForms[type][authority];

  return <PostSubmissionForm />;
};
