import { useEffect, useState } from "react";
import { UserRoles } from "shared-types";

import { useGetUser } from "@/api";

export const useReadOnlyUser = () => {
  const { data: user, isFetched: isUserFetched } = useGetUser();
  const [readOnly, setReadOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserFetched) {
      const role = user?.user?.role;
      setReadOnly(role !== UserRoles.STATE_SUBMITTER);
      setIsLoading(false);
    }
  }, [user, isUserFetched]);

  return { readOnly, isLoading };
};
