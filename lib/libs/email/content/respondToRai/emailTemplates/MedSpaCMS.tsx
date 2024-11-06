import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  LoginInstructions,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA ${variables.id} RAI Response Submitted`;
  const heading = "The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:";

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "Medicaid SPA",
        attachments: {
          cmsForm179: {
            label: "CMS Form 179",
            files: [],
          },
          spaPages: {
            label: "SPA Pages",
            files: [
              {
                filename: "spa-pages.pdf",
                title: "SPA Pages",
                bucket: "test-bucket",
                key: "spa-pages.pdf",
                uploadDate: Date.now(),
              },
            ],
          },
          other: {
            label: "Other",
            files: [
              {
                filename: "other.pdf",
                title: "Other",
                bucket: "test-bucket",
                key: "other.pdf",
                uploadDate: Date.now(),
              },
            ],
          },
        },
      }}
    />
  );
};

export default MedSpaCMSEmailPreview;
