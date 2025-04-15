import { OptionCard, OptionFieldset, SimplePageContainer, SubNavHeader } from "@/components";

export const SignUp = () => {
  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Registration: User Role</h1>
      </SubNavHeader>
      <OptionFieldset legend={"Select the role for which you are registering."}>
        <OptionCard
          description="Ability to approve state submitters and submit packages"
          title="State System Administrator"
          to="/dashboard"
        />
      </OptionFieldset>
    </div>
  );
};
