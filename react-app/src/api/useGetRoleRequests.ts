import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";

import { UserRoleType } from "@/features/user-roles/UserManagement";

export const getRoleRequests = async (): Promise<UserRoleType[]> => {
  try {
    const requests = await API.get("os", "/getRoleRequests", {});
    return requests;
  } catch (e) {
    console.log({ e });
    return [];
  }
};

export const useGetRoleRequests = () =>
  useQuery({
    queryKey: ["roleRequests"],
    queryFn: getRoleRequests,
    refetchOnWindowFocus: false,
  });
