import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import handler from "../libs/handler-lib";
import { getBundle } from "../libs/bundle-lib";
import { buildAddressList } from "../libs/address-lib";
import { buildEmailData } from "../libs/data-lib";
import { getLookupValues } from "../libs/lookup-lib";

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

  // get the bundle of emails associated with this action
  const emailBundle = getBundle(record, process.env.stage);
  console.log("emailBundle: ", JSON.stringify(emailBundle, null, 4));

  // not every event has a bundle, and that's ok!
  if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) return { message: "no eventToEmailMapping found, no email sent"};

  console.log("have emails to process");
  // data is at bundle level since often identical between emails and saves on lookups
  const lookupData = {...record, ...await getLookupValues(emailBundle.lookupList, record.id)};
  const emailData = buildEmailData(emailBundle, lookupData);
  console.log("emailData is: ", emailData);

  const sendResults = await Promise.allSettled(emailBundle.emailCommands.map(async (command) => {
    try {
      console.log("the command to start is: ", command);
      command.TemplateData = JSON.stringify(emailData);
      command.Destination = { ToAddresses: buildAddressList(command.ToAddresses, emailData) };
      if (command?.CcAddresses) command.Destination.CcAddresses = buildAddressList(command.CcAddresses, emailData);
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
