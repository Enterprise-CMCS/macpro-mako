import { CommonEmailVariables, Events } from "shared-types";
import {
  LoginInstructions,
  PackageDetails,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { Link, Text } from "@react-email/components";
import { styles } from "../../email-styles";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["NewChipSubmission"] & CommonEmailVariables;
}) => {
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  const heading = "The OneMAC Submission Portal received a CHIP State Plan Amendment:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} useThisLink />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        {" "}
        If the contents of this email seem suspicious, do not open them, and instead forward this
        email to{" "}
        <Link href={`mailto:SPAM@CMS.HHS.gov`} style={{ textDecoration: "underline" }}>
          CHIPSPASubmissionMailBox@CMS.HHS.gov
        </Link>
      </Text>
    </BaseEmailTemplate>
  );
};
