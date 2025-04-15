import { OptionCard, OptionFieldset, SubNavHeader } from "@/components";

export const SignUp = () => {
  // TODO: add in logic to determine what is displayed based on current roles
  const roleOptions = [
    {
      key: "state-submitter",
      title: "State Submitter",
      description: "Responsible for submitting packages",
    },
    {
      key: "state-admin",
      title: "State System Administrator",
      description: "Ability to approve state submitters and submit packages",
    },
    {
      key: "cms-reviewer",
      title: "CMS Reviewer",
      description: "Responsible for reviewing packages",
    },
    {
      key: "cms-approver",
      title: "CMS Role Approver",
      description: "Responsible for managing CMS Reviewers and State System Admins",
    },
  ];
  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Registration: User Role</h1>
      </SubNavHeader>
      <OptionFieldset legend={"Select the role for which you are registering."}>
        {roleOptions.map((role) => (
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
