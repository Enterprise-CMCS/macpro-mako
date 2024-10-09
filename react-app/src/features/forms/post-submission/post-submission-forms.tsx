import { useParams } from "react-router-dom";
import { RespondToRai } from "./respond-to-rai";

// /actions/respond-to-rai/Medicaid SPA/1234

// the keys will relate to this part of the route /actions/{key of postSubmissionForms}/authority/id
export const postSubmissionForms: Record<string, () => React.ReactNode> = {
  "respond-to-rai": RespondToRai,
};

// /actions/withdraw-package/Medicaid SPA/MD-95-1000

export const PostSubmissionWrapper = () => {
  const { type } = useParams();
  const PostSubmissionForm = postSubmissionForms[type];

  return <PostSubmissionForm />;
};
