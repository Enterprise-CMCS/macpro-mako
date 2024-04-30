import { type getItem } from "@/api";
import { Authority, SEATOOL_STATUS } from "shared-types";

export const DataStateCheck = (data: Awaited<ReturnType<typeof getItem>>) => {
  const isExpectedStatus = (status: keyof typeof SEATOOL_STATUS) =>
    data._source.seatoolStatus === SEATOOL_STATUS[status];

  const isExpectedActionType = (actionType: "New" | "Renew" | "Amend") =>
    data._source.actionType === actionType;

  const isExpectedAuthority = (authority: Authority) =>
    data._source.authority === authority;

  const propertyExists = (propertyToCheck: keyof (typeof data)["_source"]) =>
    !!data._source[propertyToCheck];

  const withdrawEnabled = data._source.raiWithdrawEnabled;

  const recordExists = !!data;

  return {
    isExpectedStatus,
    isExpectedActionType,
    isExpectedAuthority,
    propertyExists,
    withdrawEnabled,
    recordExists,
  };
};

export type CheckStatusFunction = (
  checks: ReturnType<typeof DataStateCheck>,
) => boolean;
