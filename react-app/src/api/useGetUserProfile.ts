import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { StateCode } from "shared-types";

type Approver = { email: string; fullName: string; territory: StateCode | "N/A" };
type ApproverRaw = {
  role: string;
  territory: (StateCode | "N/A")[];
  approvers: Approver[];
};
export type StateAccess = {
  id: string;
  eventType: string;
  email: string;
  doneByEmail: string;
  doneByName: string;
  status: string;
  role: string;
  territory: string;
  approvers?: Approver[];
};

export type OneMacUserProfile = {
  stateAccess?: StateAccess[];
};

export function attachApproversToStateAccess(
  stateAccess: StateAccess[],
  approverByRole: ApproverRaw[],
): StateAccess[] {
  const roleTerritoryApproverMap: Record<
    string,
    Record<string, Omit<Approver, "territory">[]>
  > = {};

  for (const input of approverByRole) {
    if (!roleTerritoryApproverMap[input.role]) {
      roleTerritoryApproverMap[input.role] = {};
    }

    const mapByTerritory = roleTerritoryApproverMap[input.role];

    for (const approver of input.approvers) {
      const { territory, ...rest } = approver;
      if (!mapByTerritory[territory]) {
        mapByTerritory[territory] = [];
      }
      mapByTerritory[territory].push(rest);
    }
  }

  return stateAccess.map((entry) => {
    const roleMap = roleTerritoryApproverMap[entry.role];
    const approverList = roleMap?.[entry.territory] || [];
    return {
      ...entry,
      approverList,
    };
  });
}

export const getUserProfile = async (userEmail?: string): Promise<OneMacUserProfile> => {
  try {
    const stateAccess = await API.post(
      "os",
      "/getUserProfile",
      userEmail ? { body: { userEmail } } : {},
    );

    const approvers = await API.get("os", "/getApprovers", {});
    const stateAccessWithApprovers = attachApproversToStateAccess(
      stateAccess,
      approvers.approverList,
    );
    return {
      stateAccess: stateAccessWithApprovers,
    } as OneMacUserProfile;
  } catch (e) {
    console.log({ e });
    return {};
  }
};

export const useGetUserProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
  });
