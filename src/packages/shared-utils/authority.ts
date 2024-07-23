import {
  LegacyPackageAction,
  OneMac,
  SEATOOL_AUTHORITIES_MAP_TO_ID,
  SeaTool,
  SeatoolAuthority,
  SeatoolAuthorityType,
} from "shared-types";

export type AuthoryDetailsFromRecord = (
  record: OneMac | LegacyPackageAction | SeaTool,
) => {
  authorityId: (typeof SEATOOL_AUTHORITIES_MAP_TO_ID)[keyof typeof SEATOOL_AUTHORITIES_MAP_TO_ID];
  authority: SeatoolAuthorityType;
};

type SeatoolAuthorityIDType =
  (typeof SEATOOL_AUTHORITIES_MAP_TO_ID)[keyof typeof SEATOOL_AUTHORITIES_MAP_TO_ID];

export function getKeyByValue(
  value: SeatoolAuthorityIDType,
): SeatoolAuthorityType | undefined {
  return (
    Object.keys(SEATOOL_AUTHORITIES_MAP_TO_ID) as SeatoolAuthorityType[]
  ).find((key) => SEATOOL_AUTHORITIES_MAP_TO_ID[key] === value);
}

export const getAuthorityDetailsFromRecord: AuthoryDetailsFromRecord = (
  record: OneMac | LegacyPackageAction | SeaTool,
) => {
  if ("authority" in record && record.authority in SeatoolAuthority) {
    const authority = record.authority as SeatoolAuthorityType;
    return {
      authorityId: SEATOOL_AUTHORITIES_MAP_TO_ID[authority],
      authority,
    };
  }
  if (
    "STATE_PLAN" in record &&
    record.STATE_PLAN?.PLAN_TYPE !== null &&
    record.STATE_PLAN?.PLAN_TYPE !== undefined &&
    record.STATE_PLAN.PLAN_TYPE in SEATOOL_AUTHORITIES_MAP_TO_ID
  ) {
    const planType = record.STATE_PLAN.PLAN_TYPE;
    const authority = getKeyByValue(planType)!;
    return {
      authorityId: planType,
      authority,
    };
  }
  if (
    "temporaryExtensionType" in record &&
    record.temporaryExtensionType !== null &&
    record.temporaryExtensionType !== undefined &&
    record.temporaryExtensionType in SEATOOL_AUTHORITIES_MAP_TO_ID
  ) {
    const tempExtType = record.temporaryExtensionType as SeatoolAuthorityType;
    return {
      authority: tempExtType,
      authorityId: SEATOOL_AUTHORITIES_MAP_TO_ID[tempExtType],
    };
  }
  throw new Error("Unable to retrieve authority details from seatool record");
};
