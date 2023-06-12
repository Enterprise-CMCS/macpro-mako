import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateIssue, validateCreateIssue } from "shared-types";
import { API } from "aws-amplify"

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: CreateIssue) => {
      const validIssue = validateCreateIssue(issue);

      try {
        // return await instance.post("/issues", validIssue);
        return await API.post("issues", "/issues", { body: validIssue });
      } catch (err: any) {
        console.log(err);
        console.log('guitar');
        throw {
          messages: err?.response?.issues || [
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
