import { Action } from "shared-types";
import { CheckStatusFunction } from "@/features/package-actions/lib/dataStatusChecker";
import {
  ID_UPDATED_STATUS,
  INTAKE_COMPLETED_STATUS,
  PACKAGE_WITHDRAWN_STATUS,
  RAI_ISSUED_STATUS,
  RAI_RESPONDED_TO_STATUS,
  RAI_WITHDRAWN_STATUS,
  RAI_WITHDRAW_DISABLED_STATUS,
  RAI_WITHDRAW_ENABLED_STATUS,
  TEMPORARY_EXTENSION_REQUESTED_STATUS,
} from "./modules";

export const correctStatusToStopPollingData = (a: Action) => {
  const actionContentMap: Record<string, CheckStatusFunction> = {
    "issue-rai": RAI_ISSUED_STATUS,
    "respond-to-rai": RAI_RESPONDED_TO_STATUS,
    "enable-rai-withdraw": RAI_WITHDRAW_ENABLED_STATUS,
    "disable-rai-withdraw": RAI_WITHDRAW_DISABLED_STATUS,
    "withdraw-rai": RAI_WITHDRAWN_STATUS,
    "withdraw-package": PACKAGE_WITHDRAWN_STATUS,
    "temporary-extension": TEMPORARY_EXTENSION_REQUESTED_STATUS,
    "update-id": ID_UPDATED_STATUS,
    "complete-intake": INTAKE_COMPLETED_STATUS,
  };
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No status for group "${a}"`);
  return group;
};
