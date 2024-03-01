import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import handler from "../libs/handler-lib";
import { getBundle } from "../libs/bundle-lib";
import { buildDestination } from "../libs/address-lib";
import { buildEmailData } from "../libs/data-lib";

const SES = new SESClient({ region: process.env.region });

// const createSendTemplatedEmailCommand = (data) =>
// (new SendTemplatedEmailCommand({
//   Source: process.env.emailSource ?? "kgrue@fearless.tech",
//   Destination: data.Destination,
//   TemplateData: data.TemplateData,
//   Template: data.Template,
//   ConfigurationSetName: process.env.emailConfigSet,
// }));

export const main = handler(async (record) => {

  // get the bundle of emails associated with this action
  const emailBundle = getBundle(record, process.env.stage);

  // not every event has a bundle, and that's ok!
  if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) return { message: "no eventToEmailMapping found, no email sent" };

  // data is at bundle level since often identical between emails and saves on lookups
  const emailData = await buildEmailData(emailBundle, record);

  const sendResults = await Promise.allSettled(emailBundle.emailCommands.map(async (command) => {
    try {
      // command.TemplateData = JSON.stringify(emailData);
      // command.Destination = buildDestination(command, emailData);

      // const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(command);
      // console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));

      //      return await SES.send(sendTemplatedEmailCommand);
      return await SES.send(new SendTemplatedEmailCommand({
        Source: process.env.emailSource ?? "kgrue@fearless.tech",
        Destination: buildDestination(command, emailData),
        TemplateData: JSON.stringify(emailData),
        Template: command.Template,
        ConfigurationSetName: process.env.emailConfigSet,
      }));
    } catch (err) {
      console.log("Failed to process theEmail.", err, JSON.stringify(command, null, 4));
      return Promise.resolve({ message: err.message});
    }
  }));
  return sendResults;
});