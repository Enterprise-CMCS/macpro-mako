import { UserRole } from "shared-types/events/legacy-user";

import { StateAccess } from "@/api";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { RoleStatusCardLegacy } from "./RoleStatusCardLegacy";
import { RoleStatusCardNew } from "./RoleStatusCardNew";

export type RoleStatusProps = {
  isNewUserRoleDisplay?: boolean;
  role: UserRole;
  onClick?: () => void;
  access: Omit<StateAccess, "id" | "eventType" | "email">;
};

export const RoleStatusCard = (props: RoleStatusProps) => {
  const { access } = props;
  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");

  if (!access) return null;

  if (isNewUserRoleDisplay) {
    return <RoleStatusCardNew {...props} />;
  }

  return <RoleStatusCardLegacy {...props} />;
};
