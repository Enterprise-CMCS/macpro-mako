import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
import { StateCode } from "shared-types";

export type Approver = { email: string; fullName: string; territory: StateCode | "N/A" };
type ApproverRaw = {
  role: string;
  statusCode?: number;
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
  approverList?: Approver[];
  group?: string;
  division?: string;
};

export type OneMacUserProfile = {
  stateAccess?: StateAccess[];
};

export function attachApproversToStateAccess(
  stateAccess: StateAccess[],
  approverByRole: ApproverRaw[],
): StateAccess[] {
  const roleTerritoryApproverMap: { [key: string]: any } = {};
  if (!approverByRole) return stateAccess;
  if (!approverByRole.length) return stateAccess;

  for (const input of approverByRole) {
    if (!roleTerritoryApproverMap[input.role]) {
      roleTerritoryApproverMap[input.role] = {};
    }

    const mapByTerritory = roleTerritoryApproverMap[input.role];
    if (!input.approvers && input.statusCode) {
      console.log("Error - missing approvers", input);
      continue;
    }

    for (const approver of input.approvers) {
      const { territory, ...rest } = approver;
      if (!mapByTerritory[territory]) {
        mapByTerritory[territory] = [];
      }
      mapByTerritory[territory].push(rest);
    }
  }

  return stateAccess.map((entry) => {
    const territoryLookup = entry.role === "statesubmitter" ? entry.territory : "N/A";
    const roleMap = roleTerritoryApproverMap[entry.role];
    const approverList = roleMap?.[territoryLookup] || [];
    return {
      ...entry,
      approverList,
    };
  });
}

export const getUserProfile = async (userEmail?: string): Promise<OneMacUserProfile> => {
  try {
    const stateAccess = await API.post("os", "/getUserProfile", { body: { userEmail } });

    let approvers: any = { approverList: [] };
    try {
      approvers = await API.post("os", "/getApprovers", { body: { userEmail } });
    } catch (approverError) {
      console.log("Error fetching approvers:", approverError);
    }
    const stateAccessWithApprovers = attachApproversToStateAccess(
      stateAccess,
      approvers.approverList || [],
    );
    return {
      stateAccess: stateAccessWithApprovers,
    } as OneMacUserProfile;
  } catch (e) {
    sendGAEvent("api_error", {
      message: "failure /getUserDetails",
    });
    console.error("Error in getUserProfile:", e);
    return {};
  }
};

export const useGetUserProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
