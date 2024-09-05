import * as React from "react";
import { Html } from "@react-email/components";
import { OneMac } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";
import LoginInstructions from "../email-components/loginInstructions";
import { SpamWarning } from "../email-components/spamWarning";

// **** MEDICAID SPA
export const TempExtCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The Submission Portal received a {variables.authority} Waiver Extension
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Temporary Extension Request Number:</b> {variables.id}
        <b>Temporary Extension Type:</b> {variables.authority}
      </p>
      Summary: {variables.additionalInformation}
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const TempExtStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms you have submitted a {variables.authority} Waiver
        Extension to CMS for review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Temporary Extension Request Number:</b> {variables.id}
        <b>Temporary Extension Type:</b> {variables.authority}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(
          Number(variables.notificationMetadata?.submissionDate),
        )}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This mailbox is for the submittal of Section 1915(b) and 1915(c)
        Waivers, responses to Requests for Additional Information (RAI) on
        Waivers, and extension requests on Waivers only. Any other
        correspondence will be disregarded
      </p>
      <p>
        If you have questions or did not expect this email, please contact
        <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      </p>
      <p>Thank you!</p>`, text: ` This response confirms you have submitted a $
      {variables.authority} Waiver Extension to CMS for review: State or
      territory: {variables.territory}
      Name: {variables.submitterName}
      Email Address: {variables.submitterEmail}
      Temporary Extension Request Number: {variables.id}
      Temporary Extension Type: {variables.authority}
      90th day deadline: $
      {formatNinetyDaysDate(
        Number(variables.notificationMetadata?.submissionDate),
      )}
      Summary: {variables.additionalInformation}
      This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
      responses to Requests for Additional Information (RAI), and extension
      requests on Waivers only. Any other correspondence will be disregarded. If
      you have any questions, please contact spa@cms.hhs.gov or your state lead.
      Thank you!
    </Html>
  );
};

export default TempExtCMSEmail;
