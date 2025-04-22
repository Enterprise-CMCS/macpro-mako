import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

export type RoleRequest = {
  email: string;
  state: StateCode;
  role: string;
  eventType: string;
  grantAccess?: boolean; // true for active, false for denied, undefined for pending
};

export const submitRoleRequests = async (request: RoleRequest) => {
  const roleRequest = await API.post("os", "/submitRoleRequests", {
    body: request,
  });
  return roleRequest;
};

// export const useSubmitRoleRequests = () =>
//   useMutation({
//     mutationFn: submitRoleRequests,
//   });

export const useSubmitRoleRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRoleRequests,

    onMutate: async (newRequest) => {
      await queryClient.cancelQueries(["roleRequests"]);
      // Save current cache in case there's an error
      const previousRequests = queryClient.getQueryData<RoleRequest[]>(["roleRequests"]);
      // Updates existing cache if anything changed
      queryClient.setQueryData(["roleRequests"], (old: RoleRequest[] = []) => {
        if (!Array.isArray(old)) return [];
        return old.map((request) =>
          request.email === newRequest.email ? { ...request, ...newRequest } : request,
        );
      });

      return { previousRequests };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(["roleRequests"]);
      await queryClient.refetchQueries(["roleRequests"]);
    },

    onError: ({ context }) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(["roleRequests"], context.previousRequests);
      }
    },
  });
};
