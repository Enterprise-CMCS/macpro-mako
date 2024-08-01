import { useGetUser } from "@/api";
import { UserRoles } from "shared-types";

export const useReadOnlyUser = () => {
  const { data } = useGetUser();
  const role = data?.user?.["custom:cms-roles"];
  return role !== UserRoles.STATE_SUBMITTER;
};
