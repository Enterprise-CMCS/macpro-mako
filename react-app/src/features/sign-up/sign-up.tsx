import { useGetUserDetails } from "@/api";
import { LoadingSpinner, OptionCard, OptionFieldset, SubNavHeader } from "@/components";

export const SignUp = () => {
  const { data: userDetails } = useGetUserDetails();
  if (!userDetails) return <LoadingSpinner />;

  const role = userDetails.role;
  const cmsOrState = (() => {
    if (role.includes("state")) return "state";
    return "cms";
  })();

  const roleOptions = [
    {
      key: "statesubmitter",
      title: "State Submitter",
      description: "Responsible for submitting packages",
    },
    {
      key: "statesystemadmin",
      title: "State System Administrator",
      description: "Ability to approve state submitters and submit packages",
    },
    {
      key: "cmsreviewer",
      title: "CMS Reviewer",
      description: "Responsible for reviewing packages",
    },
    {
      key: "cmsroleapprover",
      title: "CMS Role Approver",
      description: "Responsible for managing CMS Reviewers and State System Admins",
    },
  ];

  const displayRoleOptions = roleOptions.filter(
    (options) => options.key.includes(cmsOrState) && options.key !== role,
  );

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Registration: User Role</h1>
      </SubNavHeader>
      <OptionFieldset legend={"Select the role for which you are registering."}>
        {displayRoleOptions.map((role) => (
          <OptionCard
            description={role.description}
            title={role.title}
            to="/dashboard"
            key={role.key}
          />
        ))}
      </OptionFieldset>
    </div>
  );
};
