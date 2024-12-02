import { CommonEmailVariables } from "shared-types";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { ContactStateLead } from "../../email-components";

export const ChipSpaStateEmail = (props: { variables: WithdrawPackage & CommonEmailVariables }) => {
  const variables = props.variables;
  return (
    <Html
      lang="en"
      dir="ltr"
    >
      <Container>
        <h3>
          This email is to confirm CHIP SPA {variables.id} was withdrawn by
          {variables.submitterName}. The review of CHIP SPA {variables.id} has concluded.
        </h3>
        <ContactStateLead isChip />
      </Container>
    </Html>
  );
};