import { emailTemplateValue } from "../data";
import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA ${variables.id} RAI Response Submitted`;
  const heading = "The OneMAC Submission Portal received a CHIP SPA RAI Response Submission";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={styles.text.description}>
        {`This response confirms receipt of your CHIP State Plan Amendment (SPA) or your response to a
        SPA Request for Additional Information (RAI). You can expect a formal response to your
        submittal to be issued within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}
        .`}
      </Text>
    </BaseEmailTemplate>
  );
};

const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "CHIP SPA",
        attachments: {
          cmsForm179: {
            label: "CMS Form 179",
            files: [
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
          },
          spaPages: {
            label: "SPA Pages",
            files: [],
          },
          other: {
            label: "Other",
            files: [],
          },
        },
      }}
    />
  );
};

export default ChipSpaStateEmailPreview;
