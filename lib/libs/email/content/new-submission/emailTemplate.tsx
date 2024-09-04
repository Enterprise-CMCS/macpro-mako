import * as React from "react";
import { DateTime } from "luxon";
import { Html } from "@react-email/components";
import { OneMac } from "shared-types";
import {
  CommonVariables,
  formatDate,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";
import LoginInstructions from "../email-components/loginInstructions";
import { SpamWarning } from "../email-components/spamWarning";

// **** MEDICAID SPA
export const MedSpaCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>The OneMAC Submission Portal received a Medicaid SPA Submission:</p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <b>State or territory:</b> {variables.territory}
      <b>Name:</b> {variables.submitterName}
      <b>Email:</b> {variables.submitterEmail}
      <b>Medicaid SPA ID: {variables.id}</b>
      <b>Proposed Effective Date:</b>
      {formatDate(variables.notificationMetadata?.proposedEffectiveDate)}
      <b>Files:</b>
      {formatAttachments("html", variables.attachments)}
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
        This response confirms that you submitted a Medicaid SPA to CMS for
        review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Medicaid SPA ID: {variables.id}</b>
        <b>Proposed Effective Date:</b> $
        {formatDate(variables.notificationMetadata?.proposedEffectiveDate)}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}
      </p>
      <b>Summary:</b>
      {variables.additionalInformation}
      <p>
        This response confirms the receipt of your Medicaid State Plan Amendment
        (SPA or your response to a SPA Request for Additional Information
        (RAI)). You can expect a formal response to your submittal to be issued
        within 90 days, before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
      <p>
        This mailbox is for the submittal of State Plan Amendments and
        non-web-based responses to Requests for Additional Information (RAI) on
        submitted SPAs only. Any other correspondence will be disregarded.
      </p>
      <p>
        If you have questions or did not expect this email, please contact
        <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a>.
      </p>
      <p>Thank you!</p>
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
      <p>The OneMAC Submission Portal received a CHIP State Plan Amendment:</p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email:</b> {variables.submitterEmail}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary: {variables.additionalInformation}
      <p>Files: {formatAttachments("html", variables.attachments)}</p>
      <SpamWarning />
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
        This is confirmation that you submitted a CHIP State Plan Amendment to
        CMS for review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This response confirms the receipt of your CHIP State Plan Amendment
        (CHIP SPA). You can expect a formal response to your submittal from CMS
        at a later date.
      </p>
      <p>
        If you have questions or did not expect this email, please contact
        <a href="mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov">
          CHIPSPASubmissionMailBox@CMS.HHS.gov
        </a>{" "}
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
        The OneMAC Submission Portal received a 1915(b) {variables.actionType}{" "}
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>{variables.actionType} Number:</b> {variables.id}
        <b>Waiver Authority:</b> {variables.authority}
        <b>Proposed Effective Date:</b> $
        {DateTime.fromMillis(
          Number(variables.notificationMetadata?.proposedEffectiveDate),
        ).toFormat("DDDD")}
      </p>
      <b>Summary:</b>
      {variables.additionalInformation}
      <b>Files:</b>
      {formatAttachments("html", variables.attachments)}
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
        This response confirms the submission of your 1915(b) $
        {variables.actionType} to CMS for review:
      </p>
      <b>State or territory:</b> {variables.territory}
      <b>Name:</b> {variables.submitterName}
      <b>Email Address:</b> {variables.submitterEmail}
      <b>{variables.actionType} Number:</b> {variables.id}
      <b>Waiver Authority:</b> {variables.authority}
      <b>Proposed Effective Date:</b> $
      {DateTime.fromMillis(
        Number(variables.notificationMetadata?.proposedEffectiveDate),
      ).toFormat("DDDD")}
      <b>90th Day Deadline:</b> $
      {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}
      <b>Summary:</b>
      {variables.additionalInformation}
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
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
      <p>Thank you!</p>
    </Html>
  );
};

// 1915c - app K
export const AppKCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a 1915(c) Appendix K Amendment
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Amendment Title:</b> {variables.appkTitle}
        <b>Waiver Amendment Number:</b> {variables.id}
        <b>Waiver Authority:</b> 1915(c)
        <b>
          Proposed Effective Date: $
          {formatDate(
            Number(variables.notificationMetadata?.proposedEffectiveDate),
          )}
        </b>
      </p>
      Summary: {variables.additionalInformation}
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const AppKStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms the submission of your 1915(c) Waiver to CMS for
        review:
      </p>
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {variables.submitterName}
        <b>Email Address:</b> {variables.submitterEmail}
        <b>Initial Waiver Number:</b> {variables.id}
        <b>Waiver Authority:</b> 1915(c)
        <b>Proposed Effective Date:</b> $
        {formatDate(
          Number(variables.notificationMetadata?.proposedEffectiveDate),
        )}
        <b>90th Day Deadline:</b> $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}
      </p>
      Summary: {variables.additionalInformation}
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
      <p>
        This mailbox is for the submittal of Section 1915(b) and 1915(c)
        Waivers, responses to Requests for Additional Information (RAI) on
        Waivers, and extension requests on Waivers only. Any other
        correspondence will be disregarded.
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
