import { DateTime } from "luxon";
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
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));

  const emailQueue: any[] = [];
  const getStateUsersFor: string[] = [];
  Object.values(event.records).forEach((oneSource) =>
    oneSource.forEach((encodedRecord) => {
      if (!encodedRecord.value) return;
      const record = { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
      console.log("here is the decoded record: ", record);
      if (record?.origin !== "micro") return;
      if (!record?.actionType) record.actionType = "initial-submission";
      record.proposedEffectiveDateNice = record?.proposedEffectiveDate ? (new Date(record.proposedEffectiveDate)).toDateString() : "Pending";

      const emailsConfig = `${record.actionType}-${record.authority.replace(" ", "-")}`;
      if (!emailsToSend[emailsConfig]) return;
      record.territory = record.id.toString().substring(0, 2);
      console.log("matching email config: ", emailsToSend[emailsConfig]);
      emailsToSend[emailsConfig].map((oneEmail) => {
        const theEmail = { ...oneEmail, ...record };
        theEmail.ToAddresses = oneEmail.sendTo.map((oneAddress) => {
          if (oneAddress === "submitterEmail") return `"State User Substitute" <k.grue.stateuser@gmail.com>`; //`"${theEmail.submitterName}" <${theEmail.submitterEmail}>`;
          if (oneAddress === "allStateUsers") getStateUsersFor.push(record.territory);
          return oneAddress;
        });

        theEmail.formattedFileList = `<ul><li>${theEmail.attachments.map((anAttachment) => anAttachment.title + ": " + anAttachment.filename).join('</li><li>')}</li></ul>`;
        theEmail.textFileList = `${theEmail.attachments.map((anAttachment) => anAttachment.title + ": " + anAttachment.filename).join('\n')}\n\n`;
        theEmail.ninetyDaysDateNice = theEmail?.submissionDate ? DateTime.fromMillis(theEmail.submissionDate)
          .setZone("America/New_York")
          .plus({ days: 90 })
          .toFormat("DDDD '@ 11:59pm' ZZZZ") : "Pending";
        emailQueue.push(theEmail);
      })
    }));

  const stateUsers = await Promise.all(getStateUsersFor.map(async (oneState) => {
    try {
      const commandListUsers = new ListUsersCommand({
        UserPoolId: process.env.cognitoPoolId,
      });
      const listUsersResponse = await Cognito.send(commandListUsers);
      console.log("listUsers response: ", JSON.stringify(listUsersResponse, null, 4));
    } catch (err) {
      console.log("Failed to List users.", err);
    }
    return {
      "state": oneState,
      "emailList": `\"${oneState} State user\" <k.grue@theta-llc.com>`
    };
  }));
  console.log("state users are: ", stateUsers);

  const sendResults = await Promise.all(emailQueue.map(async (theEmail) => {
    try {
      const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(theEmail);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));
      const response = await SES.send(sendTemplatedEmailCommand);
      console.log("sendEmailCommand response: ", JSON.stringify(response, null, 4));
      return response;
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(theEmail, null, 4));
      return Promise.resolve(err);
    }
  }));

  console.log("the sendResults are: ", sendResults);
  return sendResults;
}
