import * as React from "react";
import { Html } from "@react-email/components";
import { RaiWithdraw } from "shared-types";
import { CommonVariables } from "../..";
import {
  formatAttachments,
  MailboxWaiver,
  PackageDetails,
  ContactStateLead,
} from "../email-components";

// reused text only for withdrawing RAI
const WithdrawRAI = (props: {
  id: string;
  submitterName: string;
  submitterEmail: string;
}) => {
  return (
    <Html lang="en" dir="ltr">
      <h3>
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {props.id} was withdrawn by {props.submitterName}{" "}
        {props.submitterEmail}.
      </h3>
    </Html>
  );
};

// **** MEDICAID SPA
export const MedSpaCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <h3>
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {variables.id} was withdrawn by {variables.submitterName}{" "}
        {variables.submitterEmail}.
      </h3>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "SPA Package ID": variables.id,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <b>Files</b>:{formatAttachments("html", variables.attachments)}
    </Html>
  );
};

export const MedSpaStateEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <ContactStateLead />
    </Html>
  );
};

// **** CHIP SPA
export const ChipSpaCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
    </Html>
  );
};

export const ChipSpaStateEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <ContactStateLead isChip />
    </Html>
  );
};

// 1915b
export const Waiver1915bCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
    </Html>
  );
};

export const Waiver1915bStateEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <MailboxWaiver />
      <ContactStateLead />
    </Html>
  );
};

// 1915c - app K
export const AppKCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
        summary={variables.additionalInformation ?? null}
      />
      <h3>Files:</h3>
      {formatAttachments("html", variables.attachments)}
    </Html>
  );
};

export default MedSpaCMSEmail;
