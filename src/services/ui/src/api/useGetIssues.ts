import { useQuery } from "@tanstack/react-query";
import { validateListIssues } from "shared-types";
import { API } from "aws-amplify";

export const getIssues = async () => {
  const issues = await API.get("issues", "/issues", {});
  const validIssues = validateListIssues(issues);

  return validIssues;
};

export const useGetIssues = () =>
  useQuery({
    queryKey: ["issues"],
    queryFn: getIssues,
  });
