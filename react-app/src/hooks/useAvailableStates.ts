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
    if (!stateAccessList) {
      return FULL_CENSUS_STATES.map(({ label, value }) => ({ label, value }));
    }

    return FULL_CENSUS_STATES.filter(({ value }) => {
      const assignedRoles = stateAccessMap[value] ?? new Set();

      // Show states user doesn't have access to for role being requested
      if (!isNewUserRoleDisplay) {
        return !assignedRoles.has(roleToRequest);
      }

      // Check if user has all possible roles for this state
      return !STATE_ROLES.every((role) => assignedRoles.has(role));
    }).map(({ label, value }) => ({ label, value }));
  }, [roleToRequest, stateAccessList, stateAccessMap, isNewUserRoleDisplay]);
}
