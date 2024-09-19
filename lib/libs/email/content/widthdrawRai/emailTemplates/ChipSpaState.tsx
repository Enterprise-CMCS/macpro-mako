import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { RaiWithdraw } from "shared-types";
import { Html } from "@react-email/components";
import {
  WithdrawRAI,
  PackageDetails,
  ContactStateLead,
} from "../../email-components";
import { relatedEvent } from "./AppKCMS";

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
      />
      <ContactStateLead isChip />
    </Html>
  );
};

const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      relatedEvent={relatedEvent}
      variables={emailTemplateValue as RaiWithdraw & CommonVariables}
    />
  );
};

export default ChipSpaStateEmailPreview;
