import { decode } from "base-64";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  // UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { KafkaEvent } from "shared-types";

// import { CognitoUserAttributes } from "shared-types";

const SES = new SESClient({ region: process.env.region });
const Cognito = new CognitoIdentityProviderClient({
  region: process.env.region,
});

const emailsToSend = {
  "initial-submission-medicaid-spa": [{
    "templateBase": "initial-submission-medicaid-spa-cms",
    "sendTo": [process.env.osgEmail],
  }, {
    "templateBase": "initial-submission-medicaid-spa-state",
    "sendTo": ["submitterEmail"],
  }],
  "initial-submission-chip-spa": [{
    "templateBase": "initial-submission-chip-spa-cms",
    "sendTo": [process.env.chipEmail],
    "addCC": [`${process.env.chipCCList}`],
  }, {
    "templateBase": "initial-submission-chip-spa-state",
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
    TemplateData: JSON.stringify({ applicationEndpoint: "onemac.cms.gov", ...data }),
    Template: `${data.templateBase}_${process.env.stage}`,
    ConfigurationSetName: process.env.emailConfigSet,
  });

export const main = async (event: KafkaEvent) => {
  let response;
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));

  const results = await Promise.all(Object.values(event.records).map(async (oneSource) =>
    oneSource.map(async (encodedRecord) => {
      if (!encodedRecord.value) return Promise.resolve("No Emails Sent: Record has no value");
      const record = { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
      console.log("here is the decoded record: ", record);
      if (record?.origin !== "micro") return Promise.resolve("No Emails Sent: Not an emailable record");
      if (!record?.actionType) record.actionType = "initial-submission";
      record.proposedEffectiveDateNice = record?.proposedEffectiveDate ? (new Date(record.proposedEffectiveDate)).toDateString() : "Pending";

      const emailsConfig = `${record.actionType}-${record.authority.replace(" ", "-")}`;
      if (!emailsToSend[emailsConfig]) return Promise.resolve("No Emails Sent: No email configuration available");
      record.territory = record.id.toString().substring(0, 2);
      console.log("matching email config: ", emailsToSend[emailsConfig]);
      const sendResults = await Promise.all(emailsToSend[emailsConfig].map(async (oneEmail) => {
        const theEmail = { ...oneEmail, ...record };
        let getStateUsersFlag = false;
        theEmail.ToAddresses = oneEmail.sendTo.map((oneAddress) => {
          if (oneAddress === "submitterEmail") return `"State User Substitute" <k.grue.stateuser@gmail.com>`; //`"${theEmail.submitterName}" <${theEmail.submitterEmail}>`;
          if (oneAddress === "allStateUsers") getStateUsersFlag = true;
          return oneAddress;
        });

        if (getStateUsersFlag) {
          try {
            const commandListUsers = new ListUsersCommand({
              UserPoolId: process.env.cognitoPoolId,
            });
            const listUsersResponse = await Cognito.send(commandListUsers);
            console.log("listUsers response: ", JSON.stringify(listUsersResponse, null, 4));
          } catch (err) {
            console.log("Failed to List users.", err, JSON.stringify(oneEmail, null, 4));
          }
          theEmail.ToAddresses.push("\"State user\" <k.grue@theta-llc.com>");
        }

        try {
          theEmail.formattedFileList = `<ul><li>${theEmail.attachments.map((anAttachment) => anAttachment.title + ": " + anAttachment.filename).join('</li><li>')}</li></ul>`;
          theEmail.textFileList = `${theEmail.attachments.map((anAttachment) => anAttachment.title + ": " + anAttachment.filename).join('\n')}\n\n`;

          const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(theEmail);
          console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));
          response = await SES.send(sendTemplatedEmailCommand);
          console.log("sendEmailCommand response: ", JSON.stringify(response, null, 4));
          return response;
        } catch (err) {
          console.log("Failed to process theEmail.", err, JSON.stringify(theEmail, null, 4));
          return Promise.resolve(err);
        }
      }));

      return Promise.resolve(sendResults);
    })));
    console.log("results back are: ", JSON.stringify(results, null,4));
    return results;
};
