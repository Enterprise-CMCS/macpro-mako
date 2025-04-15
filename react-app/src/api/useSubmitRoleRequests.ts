import { API } from "aws-amplify";
import { StateCode } from "shared-types";

export const submitRoleRequests = async (states: StateCode[]) => {
  console.log(states, "STATES in api???");
  const requests = states.map(
    async (state) => await API.post("os", "/submitRoleRequests", { body: { state } }),
  );
  return Promise.all(requests);
};
