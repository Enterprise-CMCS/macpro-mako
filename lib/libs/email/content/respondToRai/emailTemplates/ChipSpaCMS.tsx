import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import { PackageDetails, BasicFooter, DetailsHeading, LoginInstructions } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = (props: { variables: Events["RespondToRai"] & CommonEmailVariables }) => {
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
          attachments: [
            {
              filename: "rai-response.pdf",
              title: "RAI Response",
              bucket: "test-bucket",
              key: "rai-response.pdf",
              uploadDate: Date.now(),
            },
            {
              filename: "spa-pages.pdf",
              title: "SPA Pages",
              bucket: "test-bucket",
              key: "spa-pages.pdf",
              ploadDate: Date.now(),
            },
          ],
        }}
      />
    </BaseEmailTemplate>
  );
};

export const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        proposedEffectiveDate: 1725062400000,
        submittedDate: 1723420800000,
        attachments: [
          {
            filename: "rai-response.pdf",
            title: "RAI Response",
            bucket: "test-bucket",
            key: "rai-response.pdf",
            uploadDate: Date.now(),
          },
          {
            filename: "spa-pages.pdf",
            title: "SPA Pages",
            bucket: "test-bucket",
            key: "spa-pages.pdf",
            uploadDate: Date.now(),
          },
        ],
        origin: "mako",
      }}
    />
  );
};

ChipSpaCMSEmailPreview.displayName = "ChipSpaCMSEmailPreview";

ChipSpaCMSEmail.displayName = "ChipSpaCMSEmail";

export default ChipSpaCMSEmailPreview;
