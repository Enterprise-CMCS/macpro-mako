import { Action } from "shared-types";
import {
  idUpdated,
  intakeCompleted,
  packageWithdrawn,
  raiIssued,
  raiRespondedTo,
  raiWithdrawalDisabled,
  raiWithdrawalEnabled,
  raiWithdrawn,
  temporaryExtensionRequested,
} from "./modules";
import { CheckDocumentFunction } from "@/utils/Poller/seaStatusPoller";

export const successCheckSwitch = (a: Action) => {
  const actionStatusMap: Record<string, CheckDocumentFunction> = {
    "issue-rai": raiIssued,
    "respond-to-rai": raiRespondedTo,
    "enable-rai-withdraw": raiWithdrawalEnabled,
    "disable-rai-withdraw": raiWithdrawalDisabled,
    "withdraw-rai": raiWithdrawn,
    "withdraw-package": packageWithdrawn,
    "temporary-extension": temporaryExtensionRequested,
    "update-id": idUpdated,
    "complete-intake": intakeCompleted,
  };
  const group = actionStatusMap?.[a];
  if (!group) throw new Error(`No status for group "${a}"`);
  return group;
};
