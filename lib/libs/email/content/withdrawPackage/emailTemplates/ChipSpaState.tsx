import { CommonEmailVariables, Events } from "lib/packages/shared-types";
import { BasicFooter, EMAIL_CONFIG, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { Link, Section, Text } from "@react-email/components";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`CHIP SPA Package ${variables.id} Withdraw Request`}
    heading="This is confirmation that you have requested to withdraw the package below. The package will no longer be considered for CMS review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or territory": variables.territory,
        Name: variables.submitterName,
        Email: variables.submitterEmail,
        "CHIP SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Section>
      <Text style={{ marginTop: "8px", fontSize: "14px" }}>
        If you have any questions, please contact{" "}
        <Link href={`mailto:${EMAIL_CONFIG.CHIP_EMAIL}`} style={{ textDecoration: "underline" }}>
          {EMAIL_CONFIG.CHIP_EMAIL}
        </Link>{" "}
        or your state lead.
      </Text>
      <Text>Thank you.</Text>
    </Section>
  </BaseEmailTemplate>
);
