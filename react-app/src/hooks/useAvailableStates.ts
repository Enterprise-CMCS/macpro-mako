import { useMemo } from "react";
import { FULL_CENSUS_STATES } from "shared-types";

import { StateAccess } from "@/api";

export function useAvailableStates(stateAccessList: StateAccess[] | undefined) {
  return useMemo(() => {
    if (!stateAccessList) {
      return FULL_CENSUS_STATES.map(({ label, value }) => ({ label, value }));
    }

    const validAccess = stateAccessList.filter(({ territory }) => territory !== "ZZ");

    const accessedStates = new Set(validAccess.map(({ territory }) => territory));

    const availableStates = FULL_CENSUS_STATES.filter(
      ({ value }) => !accessedStates.has(value) && value !== "ZZ",
    ).map(({ label, value }) => ({ label, value }));

    return availableStates;
  }, [stateAccessList]);
}
