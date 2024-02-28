import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { KafkaRecord } from "shared-types";

import handler from "../libs/handler-lib";
import { getBundle } from "../libs/bundle-lib";
import { getOsInsightData } from "../libs/os-lib";
import { getCognitoData } from "../libs/cognito-lib";
import { buildAddressList } from "../libs/address-lib";
import { buildTemplateData } from "../libs/data-lib";

const SES = new SESClient({ region: process.env.region });

const createSendTemplatedEmailCommand = (data) =>
(new SendTemplatedEmailCommand({
  Source: process.env.emailSource ?? "kgrue@fearless.tech",
  Destination: data.Destination,
  TemplateData: data.TemplateData,
  Template: data.Template,
  ConfigurationSetName: process.env.emailConfigSet,
}));

export const main = handler(async (record) => {
  console.log("record: ", record);

  const emailBundle = getBundle(record, process.env.stage);
  console.log("emailBundle: ", JSON.stringify(emailBundle, null, 4));
  if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) return "no eventToEmailMapping found, no email sent";

  let emailData = {...record};

  if (emailBundle?.lookupList && Array.isArray(emailBundle.lookupList) && emailBundle.lookupList.length > 0) {
    const lookupPromises = await Promise.allSettled(emailBundle.lookupList.map(async (lookupType: string) => {
      switch (lookupType) {
        case "osInsights":
          return await getOsInsightData(emailData.id);
        case "cognito":
          return await getCognitoData(emailData.id);
        default:
          return await Promise.resolve(`Don't have function for ${lookupType}`);
      }
    }))
    console.log("lookupPromises: ", lookupPromises);
    lookupPromises.forEach((promise) => {
      if (promise.status === "fulfilled") emailData = {...emailData, ...promise.value};
    })
  }
  console.log("emailData after lookups: ", emailData);
  emailBundle.TemplateData = buildTemplateData(emailBundle.TemplateDataList, emailData);

  const sendResults = await Promise.allSettled(emailBundle.emailCommands.map(async (command) => {
    try {
      console.log("the command to start is: ", command);
      command.TemplateData = JSON.stringify(emailBundle.TemplateData);
      command.Destination = { ToAddresses: buildAddressList(command.ToAddresses, emailBundle.TemplateData) };
      if (command?.CcAddresses) command.Destination.CcAddresses = buildAddressList(command.CcAddresses, emailBundle.TemplateData);
      console.log("the command being built is: ", command);

      const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(command);
      console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      return await SES.send(sendTemplatedEmailCommand);
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(command, null, 4));
      return Promise.resolve(err);
    }
  }));
  console.log("the sendResults are: ", JSON.stringify(sendResults, null, 4));
  return sendResults;
});
