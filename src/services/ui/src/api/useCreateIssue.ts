import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { CreateIssueSchema, validateCreateIssue } from "./validators";

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: CreateIssueSchema) => {
      const validIssue = validateCreateIssue(issue);

      return await instance.post("/issues", validIssue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
    },
  });
};
