import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Action, Authority, KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates } from "./../libs/email";

export const sesClient = new SESClient({ region: process.env.REGION });

export const handler: Handler<KafkaEvent> = async (event) => {
  try {
    const emailAddressLookupSecretName =
      process.env.emailAddressLookupSecretName;
    const applicationEndpointUrl = process.env.applicationEndpointUrl;

    if (!emailAddressLookupSecretName || !applicationEndpointUrl) {
      throw new Error("Environment variables are not set properly.");
    }

    console.log("Processing email event: ", JSON.stringify(event, null, 2));

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
    throw error;
  }
};

export async function processRecord(
  kafkaRecord: KafkaRecord,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
) {
  const { key, value, timestamp } = kafkaRecord;

  const id: string = decodeBase64WithUtf8(key);

  if (!value) {
    console.log("Tombstone detected. Doing nothing for this event");
    return;
  }

  const record = {
    timestamp,
    ...JSON.parse(decodeBase64WithUtf8(value)),
  };

  if (record?.origin === "micro") {
    const action: Action | "new-submission" = determineAction(record);
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
}

function determineAction(record: any): Action | "new-submission" {
  if (!record.actionType || record.actionType === "new-submission") {
    return record.seaActionType === "Extend"
      ? Action.TEMP_EXTENSION
      : "new-submission";
  }
  return record.actionType;
}

export async function processAndSendEmails(
  action: Action | "new-submission",
  authority: Authority,
  record: any,
  id: string,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
) {
  console.log("processAndSendEmails has been called");
  const emailAddressLookup = JSON.parse(
    await getSecret(emailAddressLookupSecretName),
  );

  const templates = await getEmailTemplates<typeof record>(action, authority);

  const templateVariables = {
    ...record,
    id,
    applicationEndpointUrl,
    territory: id.slice(0, 2),
    emails: emailAddressLookup,
  };

  console.log(
    "template variables: ",
    JSON.stringify(templateVariables, null, 2),
  );

  const sendEmailPromises = templates.map(async (template) => {
    const filledTemplate = await template(templateVariables);

    await sendEmail({
      to: filledTemplate.to,
      ...(filledTemplate.cc ? { cc: filledTemplate.cc } : {}),
      from: emailAddressLookup.sourceEmail,
      subject: filledTemplate.subject,
      html: filledTemplate.html,
      text: filledTemplate.text,
    });
  });

  await Promise.all(sendEmailPromises);
}

export async function sendEmail(emailDetails: {
  to: string;
  cc?: string;
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

  const command = new SendEmailCommand(params);
  await sesClient.send(command);
}
