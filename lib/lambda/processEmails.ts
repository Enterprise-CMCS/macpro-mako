import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  Action,
  Authority,
  AuthorityUnion,
  EmailAddresses,
  KafkaEvent,
  KafkaRecord,
} from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplate } from "./../libs/email/email-templates"; // Import the email templates

const sesClient = new SESClient({ region: process.env.REGION });

export const handler: Handler<KafkaEvent> = async (event) => {
  // Get email addresses stored in secrets manager
  const emailAddressLookup = JSON.parse(
    await getSecret(process.env.emailAddressLookupSecretName!),
  );

  // Get stuff from the environment
  const { applicationEndpointUrl } = process.env;

  // Log the Event
  console.log("Processing email event: " + JSON.stringify(event, null, 2));

  // And lets get started sending the emails
  try {
    // For each topic
    for (const topicPartition of Object.keys(event.records)) {
      // For each record in this topic
      for (const rec of event.records[topicPartition]) {
        const kafkaRecord: KafkaRecord = rec;
        const { key, value, timestamp } = kafkaRecord;

        // Extract/decode the id
        const id: string = decodeBase64WithUtf8(key);

        // Handle tombstone events
        if (!value) {
          console.log("Tombstone detected. Doing nothing for this event");
          continue;
        }

        // Extract/decode the record value
        const record = {
          timestamp, // why am i doing this... this is copy/paste i think
          ...JSON.parse(decodeBase64WithUtf8(value)),
        };

        // Handle micro events
        if (record?.origin === "micro") {
          console.log();
          console.log(
            `Handling event for ${id}: ` + JSON.stringify(record, null, 2),
          );

          // Set the action with some unfortuante logic that needs refactored
          let action: Action | "new-submission";
          switch (record.actionType) {
            case undefined:
            case "new-submission":
              if (record.seaActionType === "Extend") {
                action = Action.TEMP_EXTENSION;
              } else {
                action = "new-submission";
              }
              break;
            default:
              action = record.actionType;
              break;
          }

          // Set the authority with some unfortunate lower case logic
          const authority = record.authority.toLowerCase() as Authority;

          // Get the template
          const template = await getEmailTemplate<typeof record>(
            action,
            authority,
            "state", // todo... send both cms and state
          );

          // Set the template variables; consists of the event data and some add ons.
          const tempalteVariables = {
            ...record,
            id,
            applicationEndpointUrl,
            territory: id.slice(0, 2),
          };

          // Generate the email from the template and the template variables
          const filledTemplate = await template(tempalteVariables);

          // Send the email
          await sendEmail({
            to: "mdial@fearless.tech", // todo... resolve actual endpoint
            from: emailAddressLookup.sourceEmail,
            subject: filledTemplate.subject,
            html: filledTemplate.html,
            text: filledTemplate.text,
          });
        } else {
          // Handle non micro events
          console.log(
            "Event is not originating from micro. Doing nothing and continuing.",
          );
          continue;
        }
      }
    }
  } catch (error) {
    console.error(error);
    // throw error;
  }
};

async function sendEmail(emailDetails: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const { to, from, subject, html, text } = emailDetails;

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Data: html },
        Text: text ? { Data: text } : undefined,
      },
      Subject: { Data: subject },
    },
    Source: from,
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
