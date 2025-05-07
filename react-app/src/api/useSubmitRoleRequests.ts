import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "./useGetUserProfile";

export type RoleStatus = "active" | "denied" | "pending" | "revoked";
export type RoleRequest = {
  email: string;
  state: StateCode | "N/A";
  role: UserRole;
  eventType: string;
  requestRoleChange: boolean; // is this a role change request? (used in state signup and profile page)
  grantAccess?: RoleStatus; // active, denied, revoked, or pending if undefined (used in user management page)
  group?: string; // used for systemadmins upgrading defaultcmsuser to cmsroleapprover
  division?: string; // used for systemadmins upgrading defaultcmsuser to cmsroleapprover
};

export const submitRoleRequests = async (request: RoleRequest): Promise<{ message: string }> => {
  try {
    const roleRequest = await API.post("os", "/submitRoleRequests", {
      body: request,
    });
    return roleRequest;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to submit role request");
  }
};

export const useSubmitRoleRequests = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, RoleRequest, { previousRequests?: StateAccess[] }>(
    {
      mutationFn: submitRoleRequests,

      onMutate: async (newRequest) => {
        await queryClient.cancelQueries(["roleRequests"]);
        // Save current cache in case there's an error
        const previousRequests: StateAccess[] | undefined = queryClient.getQueryData<StateAccess[]>(
          ["roleRequests"],
        );
        // Updates existing cache if anything changed
        queryClient.setQueryData(["roleRequests"], (old: StateAccess[] = []) => {
          if (!Array.isArray(old)) return [];
          return old.map((request) => {
            if (request.id === `${newRequest.email}_${newRequest.state}_${newRequest.role}`) {
              let status = "pending";
              if (newRequest.grantAccess !== undefined) status = newRequest.grantAccess;
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
    },
  );
};
