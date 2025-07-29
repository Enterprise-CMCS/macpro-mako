import { useMemo } from "react";
import { FULL_CENSUS_STATES, STATE_ROLES } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "@/api";

import { useStateAccessMap } from "../api/useStateAccessMap";
import { useFeatureFlag } from "./useFeatureFlag";

export function useAvailableStates(
  roleToRequest: UserRole,
  stateAccessList: StateAccess[] | undefined,
) {
  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");
  const stateAccessMap = useStateAccessMap(stateAccessList ?? []);
  return useMemo(() => {
    const formatOption = ({ label, value }: (typeof FULL_CENSUS_STATES)[number]) => ({
      label: isNewUserRoleDisplay ? `${label}, ${value}` : label,
      value,
    });

    if (!stateAccessList) {
      return FULL_CENSUS_STATES.map(({ label, value }) => ({
        label: isNewUserRoleDisplay ? `${label}, ${value}` : label,
        value,
      }));
    }

    // Check if user has all possible roles for this state (Feature Flag ON)
    // Show states user doesn't have access to for role being requested (Feature Flag OFF)
    const shouldIncludeState = (stateCode: string) => {
      const activeStates = stateAccessMap[stateCode] ?? new Set<UserRole>();
      return isNewUserRoleDisplay
        ? !STATE_ROLES.every((role) => activeStates.has(role))
        : !activeStates.has(roleToRequest);
    };

    return FULL_CENSUS_STATES.filter(({ value }) => shouldIncludeState(value)).map(formatOption);
  }, [roleToRequest, stateAccessList, stateAccessMap, isNewUserRoleDisplay]);
}
