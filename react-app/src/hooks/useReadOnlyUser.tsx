import { useGetUser } from "@/api";
import { UserRoles } from "shared-types";
import { useEffect, useState } from "react";

export const useReadOnlyUser = () => {
  const { data: user, isFetched: isUserFetched } = useGetUser();
  const [readOnly, setReadOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserFetched) {
      const role = user?.user?.["custom:cms-roles"];
      setReadOnly(role !== UserRoles.STATE_SUBMITTER);
      setIsLoading(false);
    }
  }, [user, isUserFetched]);

  return { readOnly, isLoading };
};
