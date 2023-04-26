import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { UpdateIssueSchema, validateUpdateIssue } from "./validators";

export const useUpdateissue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: UpdateIssueSchema) => {
      const validIssue = validateUpdateIssue(issue);

      try {
        return await instance.put(`/issues/${issue.id}`, validIssue);
      } catch (err: any) {
        throw {
          messages: err?.response?.data?.issues || [
            { message: "An Error has occured" },
          ],
        };
      }
    },
    onSuccess: (e) => {
      queryClient.refetchQueries(["issues", e.config.data.id]);
    },
    onError: (err: { messages: [{ message: string }] }) => err,
  });
};
