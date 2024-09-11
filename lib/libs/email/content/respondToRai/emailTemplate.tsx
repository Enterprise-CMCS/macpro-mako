import * as React from "react";
import { Html } from "@react-email/components";
import { RaiResponse } from "shared-types";
import { CommonVariables, formatNinetyDaysDate } from "../..";
import {
  formatAttachments,
  LoginInstructions,
  PackageDetails,
  MailboxWaiver,
  ContactStateLead,
  MailboxSPA,
} from "../email-components";

// **** MEDICAID SPA
export const MedSpaCMSEmail = (props: {
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
        }}
        summary={variables.additionalInformation}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Medicaid SPA ID": variables.id,
          "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
        }}
        summary={variables.additionalInformation}
      />
      <p>
        This response confirms receipt of your Medicaid State Plan Amendment
        (SPA or your response to a SPA Request for Additional Information
        (RAI)). You can expect a formal response to your submittal to be issued
        within 90 days, before {formatNinetyDaysDate(variables.responseDate)}.
      </p>
      <MailboxSPA />
      <ContactStateLead />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
        }}
        summary={variables.additionalInformation}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
        }}
        summary={variables.additionalInformation}
      />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Waiver Number": variables.id,
        }}
        summary={variables.additionalInformation}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Initial Waiver Number": variables.id,
          "Waiver Authority": variables.authority,
          "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
        }}
        summary={variables.additionalInformation}
      />
      <p>
        This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before {formatNinetyDaysDate(variables.responseDate)}.
      </p>
      <MailboxWaiver />
      <ContactStateLead />
    </Html>
  );
};

export default MedSpaCMSEmail;
