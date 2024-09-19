import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { RaiWithdraw } from "shared-types";
import { Html } from "@react-email/components";
import {
  WithdrawRAI,
  PackageDetails,
  ContactStateLead,
  MailboxWaiver,
} from "../../email-components";
import { relatedEvent } from "./AppKCMS";

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
      />
      <MailboxWaiver />
      <ContactStateLead />
    </Html>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      relatedEvent={relatedEvent}
      variables={emailTemplateValue as RaiWithdraw & CommonVariables}
    />
  );
};

export default Waiver1915bStateEmailPreview;
