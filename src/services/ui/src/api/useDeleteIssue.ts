import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../lib/axios";

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await instance.delete(`/issues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
    },
  });
};
