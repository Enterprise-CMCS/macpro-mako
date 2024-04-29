import { type getItem } from "@/api";
import { Action, SEATOOL_STATUS } from "shared-types";

export const correctStatusToStopPollingData = (a: Action) => {
  const actionContentMap: Record<
    string,
    (data: Awaited<ReturnType<typeof getItem>>) => boolean
  > = {
    "issue-rai": (data) => {
      return (
        data._source.seatoolStatus === SEATOOL_STATUS.PENDING_RAI &&
        !!data._source.raiRequestedDate
      );
    },
    "respond-to-rai": (data) => {
      return (
        data._source.seatoolStatus === SEATOOL_STATUS.PENDING &&
        !!data._source.raiReceivedDate
      );
    },
    "enable-rai-withdraw": (data) => {
      return data._source.raiWithdrawEnabled;
    },
    "disable-rai-withdraw": (data) => {
      return !data._source.raiWithdrawEnabled;
    },
    "withdraw-rai": (data) => {
      return (
        data._source.seatoolStatus === SEATOOL_STATUS.PENDING_RAI &&
        !!data._source.raiWithdrawnDate
      );
    },
    "withdraw-package": (data) => {
      return data._source.seatoolStatus === SEATOOL_STATUS.WITHDRAWN;
    },
    "temporary-extension": (data) => {
      return !!data;
    },
    "update-id": () => true,
    "complete-intake": () => true,
  };
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No status for group "${a}"`);
  return group;
};
