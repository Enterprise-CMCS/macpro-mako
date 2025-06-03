import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

type Approver = { email: string; fullName: string; territory: StateCode | "N/A" };
type RawData = {
  role: UserRole;
  territory: (StateCode | "N/A")[];
  approvers: Approver[];
};
export type RoleApprovers = {
  role: UserRole;
  territory: StateCode | "N/A";
  approvers: Approver[];
};

function rearrangeByTerritory(data: RawData): RoleApprovers[] {
  const { role, territory, approvers } = data;
  const approverMap = {};
  for (const approver of approvers) {
    if (!approverMap[approver.territory]) {
      approverMap[approver.territory] = [];
    }
    const { territory, ...rest } = approver;
    approverMap[territory].push(rest);
  }

  const result: RoleApprovers[] = territory.map((t) => ({
    role,
    territory: t,
    approvers: approverMap[t] || [],
  }));

  return result;
}

export const getApprovers = async (): Promise<unknown> => {
  try {
    const results = await API.get("os", "/getApprovers", {});
    return results.approverList.map((approverRole: RawData) => rearrangeByTerritory(approverRole));
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
