import * as React from "react";
import { DateTime } from "luxon";
import { Html, Container } from "@react-email/components";
// import { OneMac } from "shared-types";
import { formatNinetyDaysDate } from "../../..";
import {
  PackageDetails,
  ContactStateLead,
  MailboxWaiver,
} from "../../email-components";
import { emailTemplateValue } from "../data";

export const AppKStateEmail = (props: { variables: any }) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms the submission of your 1915(c) Waiver to CMS
          for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Initial Waiver Number": variables.id,
            "Waiver Authority": variables.authority,
            "Proposed Effective Date": DateTime.fromMillis(
              Number(variables.notificationMetadata?.proposedEffectiveDate),
            ).toFormat("DDDD"),
            "90th Day Deadline": formatNinetyDaysDate(
              variables.notificationMetadata?.submissionDate,
            ),
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <p>
          This response confirms the receipt of your Waiver request or your
          response to a Waiver Request for Additional Information (RAI). You can
          expect a formal response to your submittal to be issued within 90
          days, before
          {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}
          .
        </p>
        <MailboxWaiver />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

// To preview with on 'email-dev'
const AppKStateEmailPreview = () => {
  return <AppKStateEmail variables={{ ...emailTemplateValue }} />;
};

export default AppKStateEmailPreview;
