import { getApprovingRole, userRoleMap } from "shared-utils";

import { RoleStatusProps } from ".";

type ApproverInfoProps = {
  access: RoleStatusProps["access"];
};

export const ApproverInfo = ({ access }: ApproverInfoProps) => {
  const { role, status, approverList = [] } = access;

  const hideApprovers = status !== "pending" && role === "norole";

  if (hideApprovers) return null;

  return (
    <div className="flex flex-wrap gap-x-1">
      <span className="font-semibold">
        {userRoleMap[getApprovingRole(role)]}
        {": "}
      </span>

      {approverList.length ? (
        <ul className="contents">
          {approverList.map((approver, index) => (
            <li key={`${approver.email}-${index}`}>
              <a className="text-blue-600" href={`mailto:${approver.email}`}>
                {approver.fullName}
                {index !== access.approverList.length - 1 && ", "}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        "N/A"
      )}
    </div>
  );
};
