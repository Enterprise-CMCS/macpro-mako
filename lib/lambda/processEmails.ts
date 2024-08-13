import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Action, Authority, KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates } from "./../libs/email";

const sesClient = new SESClient({ region: process.env.REGION });

export const handler: Handler<KafkaEvent> = async (event) => {
  try {
    // Validate environment variables
    const emailAddressLookupSecretName =
      process.env.emailAddressLookupSecretName;
    const applicationEndpointUrl = process.env.applicationEndpointUrl;

    if (!emailAddressLookupSecretName || !applicationEndpointUrl) {
      throw new Error("Environment variables are not set properly.");
    }

    // Log the event
    console.log("Processing email event: " + JSON.stringify(event, null, 2));

    // Process each record
    const processRecordsPromises = [];

    for (const topicPartition of Object.keys(event.records)) {
      for (const rec of event.records[topicPartition]) {
        processRecordsPromises.push(
          processRecord(
            rec,
            emailAddressLookupSecretName,
            applicationEndpointUrl,
          ),
        );
      }
    }

    await Promise.all(processRecordsPromises);

    console.log("All emails processed successfully.");
  } catch (error) {
    console.error("Error processing email event:", error);
  }
};

async function processRecord(
  kafkaRecord: KafkaRecord,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
) {
  try {
    const { key, value, timestamp } = kafkaRecord;

    // Extract/decode the id
    const id: string = decodeBase64WithUtf8(key);

    // Handle tombstone events
    if (!value) {
      console.log("Tombstone detected. Doing nothing for this event");
      return;
    }

    // Extract/decode the record value
    const record = {
      timestamp,
      ...JSON.parse(decodeBase64WithUtf8(value)),
    };

    // Handle micro events
    if (record?.origin === "micro") {
      console.log(
        `Handling event for ${id}: ` + JSON.stringify(record, null, 2),
      );

      // Set the action
      const action: Action | "new-submission" = determineAction(record);

      // Set the authority
      const authority: Authority = record.authority.toLowerCase() as Authority;

      await processAndSendEmails(
        action,
        authority,
        record,
        id,
        emailAddressLookupSecretName,
        applicationEndpointUrl,
      );
    }
  } catch (error) {
    console.error("Error processing record:", error);
  }
}

function determineAction(record: any): Action | "new-submission" {
  if (!record.actionType || record.actionType === "new-submission") {
    return record.seaActionType === "Extend"
      ? Action.TEMP_EXTENSION
      : "new-submission";
  }
  return record.actionType;
}

async function processAndSendEmails(
  action: Action | "new-submission",
  authority: Authority,
  record: any,
  id: string,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
) {
  console.log("processAndSendEmails has been called");
  try {
    const emailAddressLookup = JSON.parse(
      await getSecret(emailAddressLookupSecretName),
    );

    // Get the templates
    const templates = await getEmailTemplates<typeof record>(action, authority);

    // Set the template variables; consists of the event data and some add-ons.
    const templateVariables = {
      ...record,
      id,
      applicationEndpointUrl,
      territory: id.slice(0, 2),
    };

    // Generate and send emails concurrently
    const sendEmailPromises = templates.map(async (template) => {
      const filledTemplate = await template(templateVariables);
      await sendEmail({
        // to: record.submitterEmail,
        to: "bpaige@fearless.tech",
        from: emailAddressLookup.sourceEmail,
        subject: filledTemplate.subject,
        html: filledTemplate.html,
        text: filledTemplate.text,
      });
    });

    await Promise.all(sendEmailPromises);
  } catch (error) {
    console.error("Error processing and sending emails:", error);
  }
}

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
