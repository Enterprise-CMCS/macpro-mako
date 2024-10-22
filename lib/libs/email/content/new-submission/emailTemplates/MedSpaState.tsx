import * as React from "react";
import { emailTemplateValue } from "../data";
import { OneMac } from "shared-types";
import { CommonVariables, formatDate, formatNinetyDaysDate } from "../../..";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  MailboxSPA,
  ContactStateLead,
} from "../../email-components";

export const MedSpaStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms that you submitted a Medicaid SPA to CMS for
          review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Medicaid SPA ID": variables.id,
            "Proposed Effective Date": formatDate(
              variables.notificationMetadata?.proposedEffectiveDate,
            ),
            "90th Day Deadline": formatNinetyDaysDate(
              variables.notificationMetadata?.submissionDate,
            ),
            Summary: variables.additionalInformation,
          }}
        />
        <p>
          This response confirms the receipt of your Medicaid State Plan
          Amendment (SPA or your response to a SPA Request for Additional
          Information (RAI)). You can expect a formal response to your submittal
          to be issued within 90 days, before{" "}
          {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}
          .
        </p>
        <MailboxSPA />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

// To preview with 'email-dev'
const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
