import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Link, Text } from "@react-email/components";
import { PackageDetails, DetailsHeading } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = (props: {
  variables: Events["NewChipSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  const heading =
    "This is confirmation that you submitted a CHIP State Plan Amendment to CMS for review:";

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
    >
      <DetailsHeading />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        This response confirms the receipt of your CHIP State Plan Amendment (CHIP SPA). You can
        expect a formal response to your submittal from CMS at a later date.
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
