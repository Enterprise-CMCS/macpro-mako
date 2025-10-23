import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { OneMacUserProfile } from "./useGetUserProfile";

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

  return useMutation<
    { message: string },
    Error,
    RoleRequest,
    { previousProfile?: OneMacUserProfile }
  >({
    mutationFn: submitRoleRequests,

    onMutate: async (newRequest) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      const previousProfile = queryClient.getQueryData<OneMacUserProfile>(["profile"]);

      if (!previousProfile) return;

      const { email, state, role, grantAccess, eventType } = newRequest;
      const id = `${email}_${state}_${role}`;
      const oldStateAccess = previousProfile.stateAccess ?? [];

      const updatedStateAccess = oldStateAccess.some((stateAccess) => stateAccess.id === id)
        ? oldStateAccess.map((stateAccess) =>
            stateAccess.id === id
              ? {
                  ...stateAccess,
                  status: grantAccess ?? "pending",
                  eventType,
                }
              : stateAccess,
          )
        : [
            ...oldStateAccess,
            {
              id,
              email,
              role,
              territory: state,
              status: grantAccess ?? "pending",
              eventType,
              doneByEmail: email,
              doneByName: "Updating...",
            },
          ];

      queryClient.setQueryData<OneMacUserProfile>(["profile"], {
        ...previousProfile,
        stateAccess: updatedStateAccess,
      });

      return { previousProfile };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }
    },
  });
};
