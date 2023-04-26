import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { validateListIssues } from "shared-types";

export const getIssues = async () => {
  const issues = await instance.get("/issues");
  const validIssues = validateListIssues(issues.data);

  return validIssues;
};

export const useGetIssues = () =>
  useQuery({
    queryKey: ["issues"],
    queryFn: getIssues,
  });
