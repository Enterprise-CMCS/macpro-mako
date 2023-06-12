import { useQuery } from "@tanstack/react-query";
import { validateGetIssue } from "shared-types";
import { API } from "aws-amplify"

export const getIssue = async (id: string) => {
  const issue = await API.get("issues", `/issues/${id}`, {});
  const validIssue = validateGetIssue(issue);

  return validIssue;
};

export const useGetIssue = (id: string) =>
  useQuery({
    queryFn: () => getIssue(id),
    queryKey: ["issues", id],
  });
