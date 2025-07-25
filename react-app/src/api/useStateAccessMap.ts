import { useMemo } from "react";
import { UserRole } from "shared-types/events/legacy-user";
import { isStateRole } from "shared-utils";

import { StateAccess } from "@/api";

type StateAccessMap = Record<string, Set<UserRole>>;

export const useStateAccessMap = (stateAccessList: StateAccess[]): StateAccessMap => {
  const accessMap = useMemo(() => {
    if (!stateAccessList) return {};

    return stateAccessList.reduce<Record<string, Set<UserRole>>>((map, access) => {
      if (access.status === "active" && isStateRole(access.role)) {
        if (!map[access.territory]) map[access.territory] = new Set();
        map[access.territory].add(access.role);
      }
      return map;
    }, {});
  }, [stateAccessList]);

  return accessMap;
};
