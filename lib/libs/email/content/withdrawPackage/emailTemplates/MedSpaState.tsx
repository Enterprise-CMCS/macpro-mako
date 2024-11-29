import { CommonEmailVariables, Events } from "shared-types";
import { Link, Section, Text } from "@react-email/components";
import { BasicFooter, Divider, EMAIL_CONFIG, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`SPA Package ${variables.id} Withdraw Request`}
    heading="This is confirmation that you have requested to withdraw the package below. The package will no longer be considered for CMS review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <Divider />
    <PackageDetails
      details={{
        "State or territory": variables.territory,
        Name: variables.submitterName,
        Email: variables.submitterEmail,
        "Medicaid SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Divider />
    <Section>
      <Text style={{ marginTop: "8px", fontSize: "14px" }}>
        If you have any questions or did not expect this email, please contact{" "}
        <Link href={`mailto:${EMAIL_CONFIG.SPA_EMAIL}`} style={{ textDecoration: "underline" }}>
          {EMAIL_CONFIG.SPA_EMAIL}
        </Link>{" "}
        or your state lead.
      </Text>
      <Text>Thank you.</Text>
    </Section>
  </BaseEmailTemplate>
);
