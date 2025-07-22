import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { EditableGroupAndDivision } from "./EditableGroupAndDivision";
export type UserInformationProps = {
  fullName: string;
  role: string;
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
    <div className="flex flex-col gap-6 md:basis-1/2">
      <h2 className="text-2xl font-bold">
        {isNewUserRoleDisplay ? "My Information" : "Profile Information"}
      </h2>

      <div className="leading-9">
        <h3 className="font-bold">Full Name</h3>
        <p>{fullName}</p>
      </div>

      {!isNewUserRoleDisplay && (
        <div className="leading-9">
          <h3 className="font-bold">Role</h3>
          <p>{role}</p>
        </div>
      )}

      <div className="leading-9">
        <h3 className="font-bold">Email</h3>
        <p>{email}</p>
      </div>

      <EditableGroupAndDivision
        group={group}
        division={division}
        email={email}
        allowEdits={allowEdits}
      />
    </div>
  );
};
