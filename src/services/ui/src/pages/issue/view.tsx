import { useParams } from "react-router-dom";
import { z } from "zod";
import { useGetIssue } from "../../api/useGetIssue";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";

export const ViewIssue = () => {
  const { id } = useParams();
  const validId = z.string().parse(id);

  const { isLoading, isError, data: issue } = useGetIssue(validId);

  if (isLoading) return <>...Loading</>;
  if (isError) return <>...Error</>;

  return (
    <div className="max-w-screen-lg mx-auto px-8">
      <UI.Typography size="lg" as="h1">
        {issue.title}
      </UI.Typography>
      <p>{issue.description}</p>
    </div>
  );
};
