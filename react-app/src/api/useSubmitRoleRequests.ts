import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

export const submitRoleRequests = async (states: StateCode[]) => {
  const requests = states.map(
    async (state) => await API.post("os", "/submitRoleRequests", { body: { state } }),
  );
  return Promise.all(requests);
};

export const useSubmitRoleRequests = () =>
  useMutation({
    mutationFn: submitRoleRequests,
  });
