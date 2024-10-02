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
import { getEmailTemplates, getAllStateUsers, StateUser } from "../libs/email";
import * as os from "./../libs/opensearch-lib";
import {
  getCpocEmail,
  getSrtEmails,
} from "./../libs/email/content/email-components";

// Constants
const region = process.env.region;
const EMAIL_LOOKUP_SECRET_NAME = process.env.emailAddressLookupSecretName;
const APPLICATION_ENDPOINT_URL = process.env.applicationEndpointUrl;
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.osDomain;
const INDEX_NAMESPACE = process.env.indexNamespace;

if (
  !region ||
  !EMAIL_LOOKUP_SECRET_NAME ||
  !APPLICATION_ENDPOINT_URL ||
  !OPENSEARCH_DOMAIN_ENDPOINT ||
  !INDEX_NAMESPACE
) {
  throw new Error("Environment variables are not set properly.");
}

export const sesClient = new SESClient({ region: region });

export const handler: Handler<KafkaEvent> = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  try {
    const processRecordsPromises = Object.values(event.records)
      .flat()
      .map((rec) => {
        console.log("Processing record:", JSON.stringify(rec, null, 2));
        return processRecord(
          rec,
          EMAIL_LOOKUP_SECRET_NAME,
          APPLICATION_ENDPOINT_URL,
        );
      });
    console.log("processRecordsPromises", processRecordsPromises);
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
  console.log("id", id);
  if (!value) {
    console.log("Tombstone detected. Doing nothing for this event");
    return;
  }

  const record = {
    timestamp,
    ...JSON.parse(decodeBase64WithUtf8(value)),
  };
  console.log("record", record);
  if (record?.origin === "OneMAC") {
    const action: Action | "new-submission" = determineAction(record);
    const authority: Authority = record.authority.toLowerCase() as Authority;
    console.log("action", action);
    console.log("authority", authority);
    console.log("record", record);
    console.log("id", id);
    console.log("emailAddressLookupSecretName", emailAddressLookupSecretName);
    console.log("applicationEndpointUrl", applicationEndpointUrl);
    console.log("getAllStateUsers", JSON.stringify(getAllStateUsers, null, 2));
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
  getAllStateUsers: (state: string) => Promise<StateUser[]>,
) {
  console.log("processAndSendEmails has been called");
  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers(territory);
  console.log("allStateUsers", JSON.stringify(allStateUsers, null, 2));

  const sec = await getSecret(emailAddressLookupSecretName);

  const item = await os.getItem(
    OPENSEARCH_DOMAIN_ENDPOINT!,
    `${INDEX_NAMESPACE}main`,
    id,
  );
  console.log("item", JSON.stringify(item, null, 2));
  console.log("OPENSEARCH_DOMAIN_ENDPOINT", OPENSEARCH_DOMAIN_ENDPOINT);
  console.log("INDEX_NAMESPACE", INDEX_NAMESPACE);
  const cpocEmail = getCpocEmail(item);
  console.log("cpocEmail", cpocEmail);
  const srtEmails = getSrtEmails(item);
  console.log("srtEmails", srtEmails);
  console.log("sec", JSON.stringify(sec, null, 2));
  const emails: EmailAddresses = JSON.parse(sec);
  console.log("emails", JSON.stringify(emails, null, 2));

  const templates = await getEmailTemplates<typeof record>(action, authority);
  console.log("templates", templates);
  const allStateUsersEmails = allStateUsers.map(
    (user) => user.formattedEmailAddress,
  );

  const templateVariables = {
    ...record,
    id,
    applicationEndpointUrl,
    territory,
    emails: { ...emails, cpocEmail, srtEmails },
    allStateUsersEmails,
  };
  console.log("templateVariables", JSON.stringify(templateVariables, null, 2));
  const sendEmailPromises = templates.map(async (template) => {
    const filledTemplate = await template(templateVariables);

    const params = createEmailParams(filledTemplate, emails.sourceEmail);
    console.log("params", JSON.stringify(params, null, 2));
    await sendEmail(params);
  });

  const results = await Promise.all(sendEmailPromises);
  console.log("results", JSON.stringify(results, null, 2));
}

export function createEmailParams(
  filledTemplate: any,
  sourceEmail: string,
): SendEmailCommandInput {
  return {
    Destination: {
      ToAddresses: filledTemplate.to,
      CcAddresses: filledTemplate.cc,
    },
    Message: {
      Body: {
        Html: { Data: filledTemplate.html, Charset: "UTF-8" },
        Text: filledTemplate.text
          ? { Data: filledTemplate.text, Charset: "UTF-8" }
          : undefined,
      },
      Subject: { Data: filledTemplate.subject, Charset: "UTF-8" },
    },
    Source: sourceEmail,
  };
}

export async function sendEmail(params: SendEmailCommandInput): Promise<any> {
  console.log("SES params:", JSON.stringify(params, null, 2));

  const command = new SendEmailCommand(params);
  try {
    const result = await sesClient.send(command);
    return { status: result.$metadata.httpStatusCode };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
