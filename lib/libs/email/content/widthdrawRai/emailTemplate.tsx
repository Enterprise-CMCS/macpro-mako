import * as React from "react";
import { Html } from "@react-email/components";
import { RaiWithdraw } from "shared-types";
import { CommonVariables, formatAttachments } from "../..";
import { SpamWarning } from "../email-components/spamWarning";
import { WithdrawRAI } from "../email-components/withdrawFormalRAI";

// **** MEDICAID SPA
const MedSpaCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <p>
        The OneMAC Submission Portal received a request to withdraw the Formal
        RAI Response. You are receiving this email notification as the Formal
        RAI for {variables.id} was withdrawn by {variables.submitterName}{" "}
        {variables.submitterEmail}.
      </p>
      <b>State or territory:</b> {variables.territory}
      <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
      <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
      <b>SPA Package ID:</b> {variables.id}
      <p>Summary: {variables.additionalInformation}</p>
      <b>Files</b>:{formatAttachments("html", variables.attachments)}
      <SpamWarning />
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
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>Medicaid SPA Package ID:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
      <p>If you have questions or did not expect this email, please contact </p>
      <a href="mailto:spa@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      <p>Thank you!</p>
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
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
      <b>Files</b>:{formatAttachments("html", variables.attachments)}
      <SpamWarning />
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
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>CHIP SPA Package ID:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
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
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>Waiver Number:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
      <b>Files</b>:{formatAttachments("html", variables.attachments)}
      <SpamWarning />
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
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>Waiver Number:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
      <p>
        This mailbox is for the submittal of Section 1915(b) and 1915(c)
        Waivers, responses to Requests for Additional Information (RAI), and
        extension requests on Waivers only. Any other correspondence will be
        disregarded.
      </p>
      <p>
        If you have questions, please contact
        <a href="mailto:SPA@cms.hhs.gov">spa@cms.hhs.gov</a> or your state lead.
      </p>
      <p>Thank you!</p>`, text: ` The OneMAC Submission Portal received a
      request to withdraw the Formal RAI Response. You are receiving this email
      notification as the Formal RAI for {variables.id} was withdrawn by{" "}
      {variables.submitterName} {variables.submitterEmail}. State or territory:{" "}
      {variables.territory}
      Name: {relatedEvent.submitterName ?? "Unknown"}
      Email Address: {relatedEvent.submitterEmail ?? "Unknown"}
      Medicaid SPA Package ID: {variables.id}
      Summary:
      {variables.additionalInformation}
      This mailbox is for the submittal of Section 1915(b) and 1915(c) Waivers,
      responses to Requests for Additional Information (RAI), and extension
      requests on Waivers only. Any other correspondence will be disregarded. If
      you have any questions, please contact spa@cms.hhs.gov or your state lead.
      Thank you!`
    </Html>
  );
};

// 1915c - app K
export const appKStateEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <p>
        <b>State or territory:</b> {variables.territory}
        <b>Name:</b> {relatedEvent.submitterName ?? "Unknown"}
        <b>Email Address:</b> {relatedEvent.submitterEmail ?? "Unknown"}
        <b>Waiver Number:</b> {variables.id}
      </p>
      Summary:
      {variables.additionalInformation}
      <p>
        Files:
        {formatAttachments("html", variables.attachments)}
      </p>
      <SpamWarning />
    </Html>
  );
};

export default MedSpaCMSEmail;
