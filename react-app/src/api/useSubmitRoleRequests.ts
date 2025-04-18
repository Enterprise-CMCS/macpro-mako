import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

export type RoleRequest = {
  email: string;
  state: StateCode;
  grantAccess?: boolean; // true for active, false for denied, undefined for pending
};

export const submitRoleRequests = async (request: RoleRequest) => {
  const roleRequest = await API.post("os", "/submitRoleRequests", {
    body: request,
  });
  return roleRequest;
};

export const useSubmitRoleRequests = () =>
  useMutation({
    mutationFn: submitRoleRequests,
  });
