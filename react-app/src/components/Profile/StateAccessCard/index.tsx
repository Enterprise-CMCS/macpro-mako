import { Clock, XIcon } from "lucide-react";
import { UserRole } from "shared-types/events/legacy-user";
import { getApprovingRole, userRoleMap } from "shared-utils";

import { CardWithTopBorder } from "@/components";
import { stateAccessStatus } from "@/utils";

export type StateAccessProps = {
  role: UserRole;
  onClick?: () => void;
  access: {
    territory: string;
    role: string;
    status: string;
    doneByName: string;
    doneByEmail: string;
    approverList?: { fullName: string; email: string }[];
  };
};

export const StateAccessCard = ({ role, onClick, access }: StateAccessProps) => {
  if (!access) return null;
  const hideApprovers = role === "norole" && access.status !== "pending";
  return (
    <CardWithTopBorder key={`${access.territory}-${access.role}`}>
      <div className="p-8 min-h-36">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">{`${userRoleMap[access.role]} - ${access.territory}`}</h3>
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
        <div className="flex">
          {access.status === "pending" && <Clock />}
          <p className="italic">{stateAccessStatus[access.status]}</p>
        </div>
        {!hideApprovers && (
          <p className="block lg:mt-8 lg:mb-2">
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
          </p>
        )}
      </div>
    </CardWithTopBorder>
  );
};
