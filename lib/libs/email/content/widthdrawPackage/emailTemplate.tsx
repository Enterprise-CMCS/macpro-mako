import * as React from "react";
import { Html } from "@react-email/components";
import { OneMac } from "shared-types";
import { CommonVariables } from "../..";
import { SpamWarning } from "../email-components/spamWarning";

// **** MEDICAID SPA
const MedSpaCMSEmail = (props: { variables: OneMac & CommonVariables }) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email:</b> {variables.submitterEmail}
        <b>Medicaid SPA Package ID:</b> {variables.id}
      </p>
      Summary: $
      {variables.additionalInformation ?? "No additional information submitted"}
      <SpamWarning />
    </Html>
  );
};

export const MedSpaStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm Medicaid SPA {variables.id} was withdrawn by $
        {variables.submitterName}. The review of Medicaid SPA {variables.id} has
        concluded.
      </p>
      <p>
        If you have questions or did not expect this email, please contact
        <a href="mailto:SPA@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      </p>
      <p>Thank you!</p>`,
    </Html>
  );
};

// **** CHIP SPA
export const ChipSpaCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary: $
      {variables.additionalInformation ?? "No additional information submitted"}
      <p>
        If the contents of this email seem suspicious, do not open them, and
        instead forward this email to
        <a href="mailto:SPAM@cms.hhs.gov">SPAM@cms.hhs.gov</a>
      </p>
      <p>Thank you!</p>
    </Html>
  );
};

export const ChipSpaStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm CHIP SPA {variables.id} was withdrawn by $
        {variables.submitterName}. The review of CHIP SPA {variables.id} has
        concluded.
      </p>
      <p>
        If you have any questions, please contact
        <a href="mailto:CHIPSPASubmissionMailbox@cms.hhs.gov">
          CHIPSPASubmissionMailbox@cms.hhs.gov
        </a>
        or your state lead.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};

// 1915b
export const Waiver1915bCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>{variables.authority} Package ID:</b> {variables.id}
      </p>
      Summary: $
      {variables.additionalInformation ?? "No additional information submitted"}
      <SpamWarning />
    </Html>
  );
};

export const Waiver1915bStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This email is to confirm {variables.authority} Waiver {variables.id} was
        withdrawn by {variables.submitterName}. The review of $
        {variables.authority} Waiver {variables.id} has concluded.
      </p>
      <p>
        If you have questions, please contact
        <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};

export default MedSpaCMSEmail;
