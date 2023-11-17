import { PackageActionURL } from "@/lib";
import { API } from "aws-amplify";
import { Action, ReactQueryApiError } from "shared-types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

type ToggleRaiWithdrawResponse = {
  body: {
    message: string;
  };
};
const disable: PackageActionURL = "/action/disable-rai-withdraw";
const enable: PackageActionURL = "/action/enable-rai-withdraw";
const validActions: Action[] = [
  Action.ENABLE_RAI_WITHDRAW,
  Action.DISABLE_RAI_WITHDRAW,
];
const url = (a: Action) => {
  if (!validActions.includes(a))
    throw Error("Invalid package action for this endpoint.");
  switch (a) {
    case Action.ENABLE_RAI_WITHDRAW:
      return enable;
    case Action.DISABLE_RAI_WITHDRAW:
      return disable;
  }
};

const toggleRaiWithdraw = async (
  id: string,
  action: Action
): Promise<ToggleRaiWithdrawResponse> =>
  await API.post("os", url(action)!, { body: { id } });

export const useToggleRaiWithdraw = (
  id: string,
  action: Action,
  options?: UseMutationOptions<ToggleRaiWithdrawResponse, ReactQueryApiError>
) => {
  return useMutation<ToggleRaiWithdrawResponse, ReactQueryApiError>(
    ["actions", id],
    () => toggleRaiWithdraw(id, action),
    options
  );
};
