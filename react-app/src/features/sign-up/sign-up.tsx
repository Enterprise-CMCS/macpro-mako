import { OptionCard, OptionFieldset } from "@/components/Cards/OptionCard";
import { SimplePageContainer } from "@/components/Container/SimplePageContainer";

import { SimplePageTitle } from "../selection-flow/plan-types";

export const SignUp = () => {
  return (
    <SimplePageContainer>
      <SimplePageTitle title={"Registration: User Role"} />
      <OptionFieldset legend={"Select the role for which you are registering."}>
        <OptionCard
          description="Ability to approve state submitters and submit packages"
          title="State System Administrator"
          to="/dashboard"
        />
      </OptionFieldset>
    </SimplePageContainer>
  );
};
