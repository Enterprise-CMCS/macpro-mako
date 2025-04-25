import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

import { StateAccess } from "./useGetUserProfile";

export type RoleRequest = {
  email: string;
  state: StateCode;
  role: string;
  eventType: string;
  requestRoleChange: boolean; // is this a role change request? (used in state signup and profile page)
  grantAccess?: boolean; // true for active, false for denied, undefined for pending (used in user management page)
};

export const submitRoleRequests = async (request: RoleRequest) => {
  const roleRequest = await API.post("os", "/submitRoleRequests", {
    body: request,
  });
  return roleRequest;
};

export const useSubmitRoleRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRoleRequests,

    onMutate: async (newRequest) => {
      await queryClient.cancelQueries(["roleRequests"]);
      // Save current cache in case there's an error
      const previousRequests: StateAccess[] = queryClient.getQueryData<StateAccess[]>([
        "roleRequests",
      ]);
      // Updates existing cache if anything changed
      queryClient.setQueryData(["roleRequests"], (old: StateAccess[] = []) => {
        if (!Array.isArray(old)) return [];
        return old.map((request) => {
          if (request.email === newRequest.email) {
            let status = "pending";
            if (newRequest.grantAccess !== undefined)
              status = newRequest.grantAccess ? "active" : "denied";
            return { ...request, status: status, ...newRequest };
          }
          return request;
        });
      });

      return { previousRequests };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(["roleRequests"], context.previousRequests);
      }
    },
  });
};
