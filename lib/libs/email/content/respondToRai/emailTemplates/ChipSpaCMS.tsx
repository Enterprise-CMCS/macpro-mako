import { emailTemplateValue } from "../../../mock-data/respond-to-rai";
import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  BasicFooter,
  DetailsHeading,
  LoginInstructions,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const { variables } = props;
  const previewText = `CHIP SPA ${variables.id} RAI Response Submitted`;
  const heading = "The OneMAC Submission Portal received a CHIP SPA RAI Response Submission";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};

export const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        attachments: {
          cmsForm179: {
            files: [
              {
                filename: "CMS_Form_179_RAI_Response.pdf",
                title: "CMS Form 179",
                bucket: "test-bucket",
                key: "cms-form-179.pdf",
                uploadDate: Date.now(),
              },
            ],
            label: "CMS Form 179",
          },
          spaPages: {
            files: [
              {
                filename: "test.pdf",
                title: "SPA Pages",
                bucket: "test-bucket",
                key: "spa-pages.pdf",
                uploadDate: Date.now(),
              },
            ],
            label: "SPA Pages",
          },
          other: {
            files: [],
            label: "Other",
          },
        },
        authority: "CHIP SPA",
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
