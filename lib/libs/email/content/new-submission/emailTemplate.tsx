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
import {
  LoginInstructions,
  SpamWarning,
  PackageDetails,
  MailboxSPA,
  ContactStateLead,
  MailboxWaiver,
} from "../email-components";

// **** MEDICAID SPA
export const MedSpaCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>The OneMAC Submission Portal received a Medicaid SPA Submission:</p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA ID": variables.id,
          "Proposed Effective Date": formatDate(
            variables.notificationMetadata?.proposedEffectiveDate,
          ),
          Summary: variables.additionalInformation,
        }}
      />
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
        This response confirms the receipt of your Medicaid State Plan Amendment
        (SPA or your response to a SPA Request for Additional Information
        (RAI)). You can expect a formal response to your submittal to be issued
        within 90 days, before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
      <MailboxSPA />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <p>
        This response confirms the receipt of your CHIP State Plan Amendment
        (CHIP SPA). You can expect a formal response to your submittal from CMS
        at a later date.
      </p>
      <ContactStateLead isChip />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${variables.actionType} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": DateTime.fromMillis(
            Number(variables.notificationMetadata?.proposedEffectiveDate),
          ).toFormat("DDDD"),
          Summary: variables.additionalInformation,
        }}
      />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${variables.actionType} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": DateTime.fromMillis(
            Number(variables.notificationMetadata?.proposedEffectiveDate),
          ).toFormat("DDDD"),
          "90th Day Deadline": formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          ),

          Summary: variables.additionalInformation,
        }}
      />
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
      <MailboxWaiver />
      <ContactStateLead />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Amendment Title": variables.appkTitle ?? null,
          "Waiver Amendment Number": variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": DateTime.fromMillis(
            Number(variables.notificationMetadata?.proposedEffectiveDate),
          ).toFormat("DDDD"),
          Summary: variables.additionalInformation,
        }}
      />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Initial Waiver Number:": variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": DateTime.fromMillis(
            Number(variables.notificationMetadata?.proposedEffectiveDate),
          ).toFormat("DDDD"),
          "90th Day Deadline": formatNinetyDaysDate(
            variables.notificationMetadata?.submissionDate,
          ),
          Summary: variables.additionalInformation,
        }}
      />
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before $
        {formatNinetyDaysDate(variables.notificationMetadata?.submissionDate)}.
      </p>
      <MailboxWaiver />
      <ContactStateLead />
    </Html>
  );
};

export default MedSpaCMSEmail;
