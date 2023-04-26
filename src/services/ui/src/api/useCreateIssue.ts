import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { CreateIssueSchema, validateCreateIssue } from "./validators";

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: CreateIssueSchema) => {
      const validIssue = validateCreateIssue(issue);

      try {
        return await instance.post("/issues", validIssue);
      } catch (err: any) {
        throw {
          messages: err?.response?.data?.issues || [
            { message: "An Error has occured" },
          ],
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
    },
    onError: (err: { messages: [{ message: string }] }) => err,
  });
};
