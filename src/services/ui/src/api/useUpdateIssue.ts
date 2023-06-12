import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateIssue, validateUpdateIssue } from "shared-types";
import { API } from "aws-amplify"

export const useUpdateissue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: UpdateIssue) => {
      const validIssue = validateUpdateIssue(issue);

      try {
        await API.put("issues", `/issues/${validIssue.id}`, { body: validIssue });
        return validIssue;
      } catch (err: any) {
        throw {
          messages: err?.response?.issues || [
            { message: "An Error has occured" },
          ],
        };
      }
    },
    onSuccess: (e) => {
      queryClient.refetchQueries(["issues", e.id]);
    },
    onError: (err: { messages: [{ message: string }] }) => err,
  });
};
