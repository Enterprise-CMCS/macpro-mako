import { XIcon } from "lucide-react";
import { UserRole } from "shared-types/events/legacy-user";
import { isStateRole, userRoleMap } from "shared-utils";

import { RoleStatusTopBorderCard } from "@/components";
import { convertStateAbbrToFullName } from "@/utils";

import { ApproverDefaultCMS, ApproverInfo } from "./ApproverInfo";
import { CardStatus } from "./CardStatus";

export type RoleStatusProps = {
  isNewUserRoleDisplay?: boolean;
  role: UserRole;
  onClick?: () => void;
  hideApprovers?: boolean;
  access: {
    territory: string;
    role: string;
    status: string;
    doneByName: string;
    doneByEmail: string;
    approverList?: { fullName: string; email: string }[];
  };
};

const StateUserRoleCard = ({
  isNewUserRoleDisplay,
  role,
  onClick,
  access,
  hideApprovers,
}: RoleStatusProps) => {
  return (
    <div className="p-8 min-h-36">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold">
          {isNewUserRoleDisplay
            ? `${userRoleMap[access.role]} - ${access.territory}`
            : convertStateAbbrToFullName(access.territory)}
        </h3>
        {role === "statesubmitter" && (
          <button
            className="text-blue-700 disabled:text-gray-200"
            disabled={!onClick}
            data-testid="self-revoke"
            title="Self Revoke Access"
            onClick={onClick}
          >
            <XIcon size={30} />
          </button>
        )}
      </div>
      <CardStatus status={access.status} isNewUserRoleDisplay={isNewUserRoleDisplay} />
      {!hideApprovers && (
        <ApproverInfo access={access} isNewUserRoleDisplay={isNewUserRoleDisplay} />
      )}
    </div>
  );
};

const CmsUserRoleCard = ({
  isNewUserRoleDisplay,
  role,
  access,
  hideApprovers,
}: RoleStatusProps) => {
  return (
    <div className="p-8 min-h-36">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold">
          {isNewUserRoleDisplay
            ? userRoleMap[access.role]
            : convertStateAbbrToFullName(access.territory)}
        </h3>
      </div>
      <CardStatus status={access.status} isNewUserRoleDisplay={isNewUserRoleDisplay} />
      {!hideApprovers &&
        (isNewUserRoleDisplay && (role === "defaultcmsuser" || role === "cmsreviewer") ? (
          <ApproverDefaultCMS isNewUserRoleDisplay={isNewUserRoleDisplay} />
        ) : (
          <ApproverInfo access={access} isNewUserRoleDisplay={isNewUserRoleDisplay} />
        ))}
    </div>
  );
};

export const RoleStatusCard = (props: RoleStatusProps) => {
  const { role, access, isNewUserRoleDisplay } = props;
  if (!access) return null;
  const hideApprovers = role === "norole" && access.status !== "pending";
  const isState = isStateRole(access.role as UserRole);
  return (
    <RoleStatusTopBorderCard
      isNewUserRoleDisplay={isNewUserRoleDisplay}
      status={access.status}
      key={`${access.territory}-${access.role}`}
    >
      {isState ? (
        <StateUserRoleCard hideApprovers={hideApprovers} {...props} />
      ) : (
        <CmsUserRoleCard hideApprovers={hideApprovers} {...props} />
      )}
    </RoleStatusTopBorderCard>
  );
};
