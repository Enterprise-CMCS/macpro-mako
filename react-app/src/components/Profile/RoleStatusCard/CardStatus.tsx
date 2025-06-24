import { Clock, XCircle } from "lucide-react";

import { roleAccessStatus, updatedRoleAccessStatus } from "@/utils";

export const CardStatus = ({
  status,
  isNewUserRoleDisplay,
}: {
  status: string;
  isNewUserRoleDisplay: boolean;
}) => {
  const statusLanguage = isNewUserRoleDisplay
    ? updatedRoleAccessStatus[status]
    : roleAccessStatus[status];
  return (
    <div className="flex items-center gap-2">
      {status === "denied" && <XCircle className="text-red-500" />}
      {status === "pending" && <Clock className="text-yellow-500" />}
      <p className="italic">{statusLanguage}</p>
    </div>
  );
};
