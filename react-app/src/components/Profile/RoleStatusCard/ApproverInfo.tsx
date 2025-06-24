import { getApprovingRole, userRoleMap } from "shared-utils";

import { RoleStatusProps } from ".";

type ApproverInfoProps = {
  access: RoleStatusProps["access"];
};

export const ApproverInfo = ({ access }: ApproverInfoProps) => {
  const showApprovers = !(access.status !== "pending" && access.role === "norole");

  if (!showApprovers) return null;

  return (
    <>
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
    </>
  );
};
