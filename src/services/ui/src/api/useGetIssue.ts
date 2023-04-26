import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { validateGetIssue } from "./validators";

export const getIssue = async (id: string) => {
  const issue = await instance.get(`/issues/${id}`);
  const validIssue = validateGetIssue(issue.data);

  return validIssue;
};

export const useGetIssue = (id: string) =>
  useQuery({
    queryFn: () => getIssue(id),
    queryKey: ["issues", id],
  });
