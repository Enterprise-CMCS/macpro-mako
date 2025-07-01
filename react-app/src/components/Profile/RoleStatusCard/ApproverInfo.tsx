import { getApprovingRole, userRoleMap } from "shared-utils";

import { RoleStatusProps } from ".";

type ApproverInfoProps = {
  access: RoleStatusProps["access"];
};

export const ApproverInfo = ({ access }: ApproverInfoProps) => {
  const { role, status, approverList = [] } = access;

  const hideApprovers = role === "systemadmin" || (status !== "pending" && role === "norole");

  if (hideApprovers) return null;

  return (
    <>
      <span className="font-semibold">
        {userRoleMap[getApprovingRole(role)]}
        {": "}
      </span>
      {approverList.length
        ? approverList.map((approver, index) => (
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
    </>
  );
};
