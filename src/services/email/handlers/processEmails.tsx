import { DateTime } from "luxon";
import { decode } from "base-64";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"; // ES Modules import

import { KafkaEvent } from "shared-types";

const SES = new SESClient({ region: process.env.region });
const SSM = new SSMClient({ region: process.env.region });

const emailsToSend = {
  "new-submission-medicaid-spa": [{
    "templateBase": "new-submission-medicaid-spa-cms",
    "sendTo": [process.env.osgEmail],
  }, {
    "templateBase": "new-submission-medicaid-spa-state",
    "sendTo": ["submitterEmail"],
  }],
  "respond-to-rai-medicaid-spa": [{
    "templateBase": "respond-to-rai-medicaid-spa-cms",
    "sendTo": [process.env.osgEmail],
  }, {
    "templateBase": "respond-to-rai-medicaid-spa-state",
    "sendTo": ["submitterEmail"],
  }],
  "new-submission-chip-spa": [{
    "templateBase": "new-submission-chip-spa-cms",
    "sendTo": [process.env.chipToEmail],
    "ccList": [process.env.chipCcList]
  }, {
    "templateBase": "new-submission-chip-spa-state",
    "sendTo": ["submitterEmail"],
  }],
}

const createSendTemplatedEmailCommand = (data) =>
  new SendTemplatedEmailCommand({
    Source: process.env.emailSource ?? "kgrue@fearless.tech",
    Destination: {
      ToAddresses: data.ToAddresses,
      CcAddresses: data.CcAddresses,
    },
    TemplateData: JSON.stringify({ applicationEndpoint: process.env.applicationEndpoint, ...data }),
    Template: `${data.templateBase}_${process.env.stage}`,
    ConfigurationSetName: process.env.emailConfigSet,
  });

  const defaultRecipients = JSON.stringify({
    "osgEmail": '"OSG" <k.grue@theta-llc.com>',
    "chipToEmail": '"CHIP To" <k.grue.cmsapprover@gmail.com>',
    "chipCcList": '"CHIP 1" <k.grue@theta-llc.com>' //;"CHIP 2" <k.grue.stateuser@gmail.com>'
  }, null, 4);

export const main = async (event: KafkaEvent) => {
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));
  const input = { // GetParameterRequest
    Name: "/om-email/recipientLists",
  };
  const command = new GetParameterCommand(input);
  const response = await SSM.send(command);
  console.log("SSM Param: ", response);
  try {
  const recipients = JSON.parse(response?.Parameter?.Value ?? defaultRecipients);
  console.log("Recipients: ", recipients);
  } catch (error) {
    console.log("SSM param error is: ", error);
  }
  
  const emailQueue: any[] = [];

  Object.values(event.records).forEach((source) =>
    source.forEach((encodedRecord) => {
      if (!encodedRecord.value) return;
      const record = { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
      console.log("Decoded record: ", record);
      if (record?.origin !== "micro") return;
      if (!record?.actionType) record.actionType = "new-submission";

      const configKey = `${record.actionType}-${record.authority.toLowerCase().replace(/\s+/g, "-")}`;
      const emailConfig = emailsToSend[configKey];

      // Early return if there's no configuration for the given key.
      if (!emailConfig) {
        console.log(`No email configuration found for: `, configKey);
        return;
      }
      console.log(`Matching email config: `, emailConfig);

      emailConfig.forEach(email => {
        const emailData = {
          ...email,
          ...record,
          territory: record.id.toString().substring(0, 2),
          ToAddresses: email.sendTo.map(address => mapAddress(address)),
          formattedFileList: formatAttachments("html"),
          textFileList: formatAttachments("text"),
          ninetyDaysDateNice: formatSubmissionDate(),
          proposedEffectiveDateNice: formatProposedEffectiveDate()
        };
        // don't include CcAddresses attribute unless we use it
        if (email?.ccList && email?.ccList.length > 0 && !!email.ccList[0]) {
          emailData.CcAddresses = email.ccList.map(address => mapAddress(address));
        }

        emailQueue.push(emailData);
      });

      function mapAddress(address) {
        if (address === "submitterEmail")
          if (record.submitterEmail === "george@example.com")
            return `"George's Substitute" <k.grue.stateuser@gmail.com>`;
          else
            return `"${record.submitterName}" <${record.submitterEmail}>`;
        return address;
      }

      function formatAttachments(formatType) {
        console.log("got attachments for format: ", record.attachments, formatType);
        const formatChoices = {
          "text": {
            begin: "\n\n",
            joiner: "\n",
            end: "\n\n"
          },
          "html": {
            begin: "<ul><li>",
            joiner: "</li><li>",
            end: "</li></ul>"
          },
        };
        const format = formatChoices[formatType];
        if (!format) {
          console.log("new format type? ", formatType);
          return "attachment List";
        }
        if (!record?.attachments || record.attachments.length===0)
          return "no attachments";
        else 
          return `${format.begin}${record.attachments.map(a => `${a.title}: ${a.filename}`).join(format.joiner)}${format.end}`;
      }

      function formatSubmissionDate() {
        if (!record?.notificationMetadata?.submissionDate) return "Pending";
        return DateTime.fromMillis(record.notificationMetadata.submissionDate)
          .plus({ days: 90 })
          .toFormat("DDDD '@ 11:59pm ET'");
      }

      function formatProposedEffectiveDate() {
        if (!record?.notificationMetadata?.proposedEffectiveDate) return "Pending";
        return DateTime.fromMillis(record.notificationMetadata.proposedEffectiveDate)
          .toFormat('DDDD');

      }
    }));

  const sendResults = await Promise.all(emailQueue.map(async (theEmail) => {
    try {
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(theEmail);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));
      return await SES.send(sendTemplatedEmailCommand);
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(theEmail, null, 4));
      return Promise.resolve(err);
    }
  }));

  console.log("the sendResults are: ", sendResults);
  return sendResults;
}
