import { useMemo } from "react";
import { FULL_CENSUS_STATES } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "@/api";

export function useAvailableStates(
  currentRole: UserRole,
  stateAccessList: StateAccess[] | undefined,
) {
  return useMemo(() => {
    if (!stateAccessList) {
      return FULL_CENSUS_STATES.map(({ label, value }) => ({ label, value }));
    }

    const validAccess = stateAccessList.filter(
      ({ role, territory }) => role === currentRole && territory !== "ZZ",
    );

    const accessedStates = new Set(validAccess.map(({ territory }) => territory));

    const availableStates = FULL_CENSUS_STATES.filter(
      ({ value }) => !accessedStates.has(value) && value !== "ZZ",
    ).map(({ label, value }) => ({ label, value }));

    return availableStates;
  }, [currentRole, stateAccessList]);
}
