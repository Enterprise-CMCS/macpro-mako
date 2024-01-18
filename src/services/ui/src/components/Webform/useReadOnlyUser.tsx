import { useGetUser } from "@/api/useGetUser";
import { CMS_READ_ONLY_ROLES } from "shared-types";

export const useReadOnlyUser = () => {
  const { data } = useGetUser();
  const role = data?.user?.["custom:cms-roles"];
  return CMS_READ_ONLY_ROLES.some((el) => role?.includes(el));
};
