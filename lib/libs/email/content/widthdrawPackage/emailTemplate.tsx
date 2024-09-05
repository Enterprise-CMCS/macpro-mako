import * as React from "react";
import { Html } from "@react-email/components";
import { OneMac } from "shared-types";
import { CommonVariables } from "../..";
import {
  SpamWarning,
  PackageDetails,
  ContactStateLead,
} from "../email-components";

// **** MEDICAID SPA
const MedSpaCMSEmail = (props: { variables: OneMac & CommonVariables }) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
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
        This email is to confirm Medicaid SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of Medicaid SPA {variables.id} has
        concluded.
      </p>
      <ContactStateLead />
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
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
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
        This email is to confirm CHIP SPA {variables.id} was withdrawn by
        {variables.submitterName}. The review of CHIP SPA {variables.id} has
        concluded.
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
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          [`${variables.authority} Package ID`]: variables.id,
          Summary: variables.additionalInformation,
        }}
      />
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
        withdrawn by {variables.submitterName}. The review of
        {variables.authority} Waiver {variables.id} has concluded.
      </p>
      <ContactStateLead />
    </Html>
  );
};

export default MedSpaCMSEmail;
