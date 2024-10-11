import { useParams } from "react-router-dom";
import { RespondToRaiChip, RespondToRaiMedicaid, RespondToRaiWaiver } from "./respond-to-rai";

// /actions/respond-to-rai/Medicaid SPA/1234

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<
  string,
  Record<string, () => React.ReactNode>
> = {
  "respond-to-rai": {
    ["1915(b)"]: RespondToRaiWaiver,
    ["1915(c)"]: RespondToRaiWaiver,
    ["Medicaid SPA"]: RespondToRaiMedicaid,
    ["CHIP SPA"]: RespondToRaiChip,
  },
};
// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type, authority } = useParams();
  const PostSubmissionForm = postSubmissionForms[type][authority];

  return <PostSubmissionForm />;
};
