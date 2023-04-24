import { useParams } from "react-router-dom";
import { z } from "zod";
import { useGetIssue } from "../../api/useGetIssue";

export const ViewIssue = () => {
  const { id } = useParams();
  const validId = z.string().parse(id);

  const { isLoading, isError, data: issue } = useGetIssue(validId);

  if (isLoading) return <>...Loading</>;
  if (isError) return <>...Error</>;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-0">{issue.title}</h1>
      {/* <p>Last Updated - {issue.updatedAt}</p> */}
      <div>{issue.title}</div>
    </div>
  );
};
