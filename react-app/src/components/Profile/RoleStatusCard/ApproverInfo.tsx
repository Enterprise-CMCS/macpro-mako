import { getApprovingRole, userRoleMap } from "shared-utils";

import { RoleStatusProps } from ".";

type ApproverInfoProps = {
  access: RoleStatusProps["access"];
  isNewUserRoleDisplay?: boolean;
};

export const ApproverInfo = ({ access, isNewUserRoleDisplay }: ApproverInfoProps) => {
  const showApprovers = !(access.status !== "pending" && access.role === "norole");

  if (!showApprovers) return null;

  return (
    <div className="block lg:mt-8 lg:mb-2">
      {isNewUserRoleDisplay && (
        <p className="mb-2">
          <strong>Approvers</strong>
        </p>
      )}

      <span className="font-semibold">
        {userRoleMap[getApprovingRole(access.role)]}
        {": "}
      </span>
      {access.approverList && access.approverList.length
        ? access.approverList.map((approver, index) => (
            <a
              className="text-blue-600"
              href={`mailto:${approver.email}`}
              key={`${approver.fullName}-${index}`}
            >
              {approver.fullName}
              {index !== access.approverList.length - 1 && ", "}
            </a>
          ))
        : "N/A"}
    </div>
  );
};

export const ApproverDefaultCMS = ({ isNewUserRoleDisplay }) => {
  return (
    <div className="block lg:mt-8 lg:mb-2">
      {isNewUserRoleDisplay && (
        <p>
          <strong>Approvers</strong>
        </p>
      )}
      <i>Automatically approved by the system</i>
    </div>
  );
};
