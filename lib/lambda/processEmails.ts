import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-ses";
import {
  Action,
  Authority,
  EmailAddresses,
  KafkaEvent,
  KafkaRecord,
} from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates } from "./../libs/email";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient();

async function getAllStateUsers(state: string, userPoolId: string) {
  const params = {
    FunctionName: process.env.FunctionName, // Replace with your actual Lambda function name
    Payload: JSON.stringify({ state, userPoolId }),
  };

  const command = new InvokeCommand(params);
  const response = await lambdaClient.send(command);

  if (response.StatusCode !== 200) {
    throw new Error("Failed to invoke Lambda function");
  }

  const payload = JSON.parse(new TextDecoder().decode(response.Payload));
  if (payload.statusCode !== 200) {
    throw new Error(payload.body);
  }

  return JSON.parse(payload.body);
}
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
      getAllStateUsers,
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
  getAllStateUsers: (state: string, userPoolId: string) => Promise<any>,
) {
  console.log("processAndSendEmails has been called");

  const stateUseInfo = await getAllStateUsers(
    id.slice(0, 2),
    process.env.userPoolId!,
  );

  console.log("State user info: ", JSON.stringify(stateUseInfo, null, 2));

  const sec = await getSecret(emailAddressLookupSecretName);
  const emailAddressLookup: EmailAddresses = JSON.parse(sec);

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
    console.log("filledTemplate: ", JSON.stringify(filledTemplate, null, 2));

    const params = {
      to: filledTemplate.to,
      cc: filledTemplate.cc,
      from: emailAddressLookup.sourceEmail,
      subject: filledTemplate.subject,
      html: filledTemplate.html,
      text: filledTemplate.text,
    };
    await sendEmail(params);
  });

  const results = await Promise.all(sendEmailPromises);
  console.log("results: ", JSON.stringify(results, null, 2));
}

export async function sendEmail(emailDetails: {
  to: string[];
  cc?: string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const { to, cc, from, subject, html, text } = emailDetails;

  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: to,
      CcAddresses: cc,
    },
    Message: {
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        Text: text ? { Data: text, Charset: "UTF-8" } : undefined,
      },
      Subject: { Data: subject, Charset: "UTF-8" },
    },
    Source: from,
  };

  // Log the final SES params
  console.log("SES params:", JSON.stringify(params, null, 2));

  const command = new SendEmailCommand(params);
  try {
    await sesClient.send(command);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
