import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

export type RoleApprovers = {
  role: UserRole;
  territory: StateCode | "N/A";
  approvers: { email: string; fullName: string }[];
};

export const getApprovers = async (): Promise<unknown> => {
  try {
    const approverList = await API.get("os", "/getApprovers", {});
    return approverList as RoleApprovers[];
  } catch (e) {
    console.log({ e });
    return null;
  }
};

export const useGetApprovers = () =>
  useQuery({
    queryKey: ["approvers"],
    queryFn: () => getApprovers(),
  });
