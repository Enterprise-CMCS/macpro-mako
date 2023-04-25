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
    <div className="max-w-screen-lg mx-auto px-8">
      <h1>{issue.title}</h1>
      <p>{issue.description}</p>
    </div>
  );
};
