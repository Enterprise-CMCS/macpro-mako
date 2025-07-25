import { Link, Text } from "@react-email/components";
import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";

import { BasicFooter, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaDetailsStateEmail = (props: {
  variables: Events["NewChipDetailsSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP Eligibility SPA ${variables.id} Submitted`;
  const heading =
    "This is confirmation that you submitted a CHIP Eligibility State Plan Amendment to CMS for review:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP Eligibility SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        This response confirms the receipt of your CHIP Eligibility State Plan Amendment (CHIP
        Eligibility SPA). You can expect a formal response to your submittal from CMS at a later
        date.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        {" "}
        If you have questions or did not expect this email, please contact{" "}
        <Link
          href={`mailto:CHIPSPASubmissionMailBox@CMS.HHS.gov`}
          style={{ textDecoration: "underline" }}
        >
          CHIPSPASubmissionMailBox@CMS.HHS.gov
        </Link>
      </Text>
    </BaseEmailTemplate>
  );
};
