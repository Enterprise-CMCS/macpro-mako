import { UserRole } from "shared-types/events/legacy-user";
import { userRoleMap } from "shared-utils";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { EditableGroupAndDivision } from "./EditableGroupAndDivision";

export type UserInformationProps = {
  fullName: string;
  role: UserRole;
  email: string;
  group?: string;
  division?: string;
  allowEdits?: boolean;
};

export const UserInformation = ({
  fullName,
  role,
  email,
  group,
  division,
  allowEdits,
}: UserInformationProps) => {
  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");
  return (
    <div className="flex flex-col gap-y-6 md:basis-1/2">
      <h2 className="text-2xl font-bold">
        {isNewUserRoleDisplay ? "My Information" : "Profile Information"}
      </h2>

      <dl className="leading-9">
        <dt className="font-bold">Full Name</dt>
        <dd>{fullName}</dd>
      </dl>

      {!isNewUserRoleDisplay && (
        <dl className="leading-9">
          <dt className="font-bold">Role</dt>
          <dd>{userRoleMap[role]}</dd>
        </dl>
      )}

      <dl className="leading-9">
        <dt className="font-bold">Email</dt>
        <dd>{email}</dd>
      </dl>

      {role !== "statesubmitter" && role !== "helpdesk" && role !== "statesystemadmin" && (
        <EditableGroupAndDivision
          group={group}
          division={division}
          email={email}
          allowEdits={allowEdits}
        />
      )}
    </div>
  );
};
