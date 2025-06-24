import { Clock, XCircle, XIcon } from "lucide-react";
import { UserRole } from "shared-types/events/legacy-user";
import { isStateRole, userRoleMap } from "shared-utils";

import { RoleStatusTopBorderCard } from "@/components/Cards";
import { updatedRoleAccessStatus } from "@/utils";

import { RoleStatusProps } from ".";
import { ApproverInfo } from "./ApproverInfo";

export const CardStatus = ({ status }: { status: string }) => {
  return (
    <div className="flex items-center gap-2">
      {status === "denied" && <XCircle className="text-red-500" />}
      {status === "pending" && <Clock className="text-yellow-500" />}
      <p className="italic">{updatedRoleAccessStatus[status]}</p>
    </div>
  );
};

export const RoleStatusCardNew = ({
  role,
  access,
  onClick,
}: Omit<RoleStatusProps, "isNewUserRoleDisplay">) => {
  if (!access) return null;
  const isState = isStateRole(access.role as UserRole);

  return (
    <RoleStatusTopBorderCard status={access.status}>
      <div className="p-8 min-h-36">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">
            {isState
              ? `${userRoleMap[access.role]} - ${access.territory}`
              : userRoleMap[access.role]}
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
        <CardStatus status={access.status} />
        {role === "defaultcmsuser" || role === "cmsreviewer" ? (
          <div className="block lg:mt-8 lg:mb-2">
            <strong>Approvers</strong>
            <br />

            <i>Automatically approved by the system</i>
          </div>
        ) : (
          <div className="block lg:mt-8 lg:mb-2">
            <p className="mb-2">
              <strong>Approvers</strong>
            </p>

            <ApproverInfo access={access} />
          </div>
        )}
      </div>
    </RoleStatusTopBorderCard>
  );
};
