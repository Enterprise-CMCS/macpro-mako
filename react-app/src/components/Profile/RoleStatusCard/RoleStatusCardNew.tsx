import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Clock, EllipsisVertical, XCircle } from "lucide-react";
import { UserRole } from "shared-types/events/legacy-user";
import { isStateRole, newUserRoleMap } from "shared-utils";

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
  const hideApprovers = status !== "pending" && role === "norole";
  const showApproverInfo =
    access.role !== "defaultcmsuser" &&
    access.role !== "cmsreviewer" &&
    access.role !== "systemadmin";

  const isPending = access.status === "pending";

  return (
    <RoleStatusTopBorderCard status={access.status}>
      <div className="p-8 min-h-36">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">
            {isState
              ? `${newUserRoleMap[access.role]} - ${access.territory}`
              : newUserRoleMap[access.role]}
          </h3>

          {(isPending || (access.status === "active" && access.role !== "defaultcmsuser")) && (
            <DropdownMenu.Root>
              <DropdownMenu.DropdownMenuTrigger
                aria-label="Role Status Options"
                data-testid="role-status-actions"
                asChild
              >
                <button
                  className="disabled:text-gray-200"
                  data-testid="self-revoke"
                  title="Self Revoke Access"
                  type="button"
                >
                  <EllipsisVertical size={30} />
                </button>
              </DropdownMenu.DropdownMenuTrigger>

              <DropdownMenu.Content
                className="flex flex-col bg-white rounded-md shadow-lg p-4 border"
                align="start"
              >
                <DropdownMenu.Item asChild>
                  <button className="text-primary" onClick={onClick} type="button">
                    {isPending ? "Cancel Request" : "Remove User Role"}
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
        </div>
        <CardStatus status={access.status} />
        {access.role === "systemadmin" && (
          <div className="block lg:mt-8 lg:mb-2">
            <strong>Approvers</strong>
            <br />
            <span>Pre-assigned</span>
          </div>
        )}

        {(access.role === "defaultcmsuser" || access.role === "cmsreviewer") && (
          <div className="block lg:mt-8 lg:mb-2">
            <strong>Approvers</strong>
            <br />

            <i>Automatically approved by the system</i>
          </div>
        )}
        {showApproverInfo && (
          <div className="block lg:mt-8 lg:mb-2">
            <p className="mb-2">{!hideApprovers && <strong>Approvers</strong>}</p>

            <ApproverInfo access={access} />
          </div>
        )}
      </div>
    </RoleStatusTopBorderCard>
  );
};
