import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

export type RoleRequest = {
  state: StateCode;
  grantAccess?: boolean; // true for active, false for denied, undefined for pending
};

export const submitRoleRequests = async (request: RoleRequest) => {
  return await
    API.post("os", "/submitRoleRequests", {
      body: request,
    }),
  // return Promise.all(promises);
};

export const useSubmitRoleRequests = () =>
  useMutation({
    mutationFn: submitRoleRequests,
  });
