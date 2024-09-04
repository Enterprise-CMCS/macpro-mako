import * as React from "react";
import { Html } from "@react-email/components";
import { RaiResponse } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";
import LoginInstructions from "../email-components/loginInstructions";
import { SpamWarning } from "../email-components/spamWarning";

// **** MEDICAID SPA
const MedSpaCMSEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a Medicaid SPA RAI Response
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email:</b> {variables.submitterEmail}
        <b>Medicaid SPA Package ID:</b> {variables.id}
      </p>
      Summary: {variables.additionalInformation}
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const MedSpaStateEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms you submitted a Medicaid SPA RAI Response to CMS
        for review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Medicaid SPA ID:</b> {variables.id}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(variables.responseDate)}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This response confirms receipt of your Medicaid State Plan Amendment
        (SPA or your response to a SPA Request for Additional Information
        (RAI)). You can expect a formal response to your submittal to be issued
        within 90 days, before {formatNinetyDaysDate(variables.responseDate)}.
      </p>
      <p>
        This mailbox is for the submittal of State Plan Amendments and non-web
        based responses to Requests for Additional Information (RAI) on
        submitted SPAs only. Any other correspondence will be disregarded.
      </p>
      <p>
        If you have questions, please contact
        <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};

// **** CHIP SPA
export const ChipSpaCMSEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a CHIP SPA RAI Response
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary: {variables.additionalInformation}
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const ChipSpaStateEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms you submitted a CHIP SPA RAI Response to CMS for
        review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>CHIP SPA Package ID:</b> {variables.id}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(variables.responseDate)}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This response confirms receipt of your CHIP State Plan Amendment (SPA or
        your response to a SPA Request for Additional Information (RAI)). You
        can expect a formal response to your submittal to be issued within 90
        days, before {formatNinetyDaysDate(variables.responseDate)}.
      </p>
      <p>
        If you have questions, please contact
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
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a {variables.authority} Waiver RAI
        Response Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Waiver Number:</b> {variables.id}
      </p>
      Summary: {variables.additionalInformation}
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const Waiver1915bStateEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms the submission of your {variables.authority}{" "}
        Waiver RAI Response to CMS for review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Initial Waiver Number:</b> {variables.id}
        <b>Waiver Authority:</b> {variables.authority}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(variables.responseDate)}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before {formatNinetyDaysDate(variables.responseDate)}.
      </p>
      <p>
        This mailbox is for the submittal of Section 1915(b) and 1915(c)
        Waivers, responses to Requests for Additional Information (RAI) on
        Waivers, and extension requests on Waivers only. Any other
        correspondence will be disregarded.
      </p>
      <p>
        If you have questions, please contact
        <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a>
        or your state lead.
      </p>
      <p>Thank you!</p>
    </Html>
  );
};

export default MedSpaCMSEmail;
