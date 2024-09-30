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
const OPENSEARCH_DOMAIN_ENDPOINT = process.env.openSearchDomainEndpoint;
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
  try {
    const processRecordsPromises = Object.values(event.records)
      .flat()
      .map((rec) =>
        processRecord(rec, EMAIL_LOOKUP_SECRET_NAME, APPLICATION_ENDPOINT_URL),
      );

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
  getAllStateUsers: (state: string) => Promise<StateUser[]>,
) {
  console.log("processAndSendEmails has been called");
  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers(territory);

  const sec = await getSecret(emailAddressLookupSecretName);

  const item = await os.getItem(
    `https://${OPENSEARCH_DOMAIN_ENDPOINT}`,
    `${INDEX_NAMESPACE}main`,
    id,
  );
  console.log("item", JSON.stringify(item, null, 2));

  const cpocEmail = getCpocEmail(item);
  const srtEmails = getSrtEmails(item);
  console.log("cpocEmail", cpocEmail);
  console.log("srtEmails", srtEmails);
  const emails: EmailAddresses = JSON.parse(sec);

  const templates = await getEmailTemplates<typeof record>(action, authority);

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

  const sendEmailPromises = templates.map(async (template) => {
    const filledTemplate = await template(templateVariables);

    const params = createEmailParams(filledTemplate, emails.sourceEmail);
    await sendEmail(params);
  });

  await Promise.all(sendEmailPromises);
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
