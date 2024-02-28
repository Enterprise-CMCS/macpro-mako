import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import handler from "../libs/handler-lib";
import { getBundle } from "../libs/bundle-lib";
import { getLookupValues } from "../libs/lookup-lib";
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

  // not every event has a bundle, and that's ok!
  if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) return { message: "no eventToEmailMapping found, no email sent"};

  // emails tend to use the same data, so build data at bundle level
  const lookupValues = await getLookupValues(emailBundle.lookupList, record.id);
  console.log("lookupValues: ", lookupValues);

  const emailData = {...record, ...lookupValues};
  console.log("emailData: ", emailData);

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
