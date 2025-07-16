import { XIcon } from "lucide-react";

import { CardWithTopBorder } from "@/components/Cards";
import { convertStateAbbrToFullName, roleAccessStatus } from "@/utils";

import { RoleStatusProps } from ".";
import { ApproverInfo } from "./ApproverInfo";

export const RoleStatusCardLegacy = ({
  role,
  access,
  onClick,
}: Omit<RoleStatusProps, "isNewUserRoleDisplay">) => {
  if (!access) return null;

  return (
    <CardWithTopBorder>
      <div className="p-8 min-h-36">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold">{convertStateAbbrToFullName(access.territory)}</h3>
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
        <p className="italic">{roleAccessStatus[access.status]}</p>
        {
          <div className="block lg:mt-8 lg:mb-2">
            <ApproverInfo access={access} />
          </div>
        }
      </div>
    </CardWithTopBorder>
  );
};
