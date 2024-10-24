import { formatNinetyDaysDate } from "../../..";
import { Html, Container } from "@react-email/components";
import { CommonEmailVariables } from "shared-types";
import {
  PackageDetails,
  MailboxWaiver,
  ContactStateLead,
} from "../../email-components";

export const TempExtStateEmail = (props: {
  variables: any & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms you have submitted a {variables.authority}{" "}
          Waiver Extension to CMS for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Temporary Extension Request Number": variables.id,
            "Temporary Extension Type": variables.authority,
            "90th Day Deadline": formatNinetyDaysDate(
              Number(variables.notificationMetadata?.submissionDate),
            ),
            summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <MailboxWaiver />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

// const TempExtCMS = () => {
//   return (
//     <TempExtStateEmail
//       variables={emailTemplateValue as any & CommonEmailVariables}
//     />
//   );
// };

// export default TempExtCMS;
