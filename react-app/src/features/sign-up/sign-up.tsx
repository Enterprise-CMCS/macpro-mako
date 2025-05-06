import { UserRole } from "shared-types/events/legacy-user";

import { useGetUserDetails } from "@/api";
import { LoadingSpinner, OptionCard, OptionFieldset, SubNavHeader } from "@/components";

type UserRoleWithNoRole = UserRole | "norole";
type RoleOptions = {
  key: UserRoleWithNoRole;
  title: string;
  description: string;
  rolesWhoCanView: UserRoleWithNoRole[];
  link: string;
};

export const SignUp = () => {
  const { data: userDetails } = useGetUserDetails();
  if (!userDetails) return <LoadingSpinner />;

  const role = userDetails.role;
  // helpdesk, system admins, and cms reviewer users don't even see request role as an option
  const roleOptions = [
    {
      key: "statesubmitter",
      title: "State Submitter",
      description: "Responsible for submitting packages",
      rolesWhoCanView: ["statesystemadmin", "norole"],
      link: "/signup/state",
    },
    {
      key: "statesystemadmin",
      title: "State System Administrator",
      description: "Ability to approve state submitters and submit packages",
      rolesWhoCanView: ["statesubmitter"],
      link: "/signup/state",
    },
    {
      key: "cmsreviewer",
      title: "CMS Reviewer",
      description: "Responsible for reviewing packages",
      rolesWhoCanView: ["cmsroleapprover"],
      link: "/signup/cms",
    },
    {
      key: "cmsroleapprover",
      title: "CMS Role Approver",
      description: "Responsible for managing CMS Reviewers and State System Admins",
      rolesWhoCanView: ["defaultcmsuser"],
      link: "/signup/cms",
    },
  ] satisfies RoleOptions[];

  const displayRoleOptions = roleOptions.filter((roleOption) => {
    return roleOption.rolesWhoCanView.find((validRole) => validRole === role);
  });

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Registration: User Role</h1>
      </SubNavHeader>
      <OptionFieldset legend={"Select the role for which you are registering"}>
        {displayRoleOptions.map((role) => (
          <OptionCard
            description={role.description}
            title={role.title}
            to={role.link}
            key={role.key}
          />
        ))}
      </OptionFieldset>
    </div>
  );
};
