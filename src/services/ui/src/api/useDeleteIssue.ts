import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await API.del("issues", `/issues/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
    },
  });
};
