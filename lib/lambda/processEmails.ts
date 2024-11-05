import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { EmailAddresses, KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates, getAllStateUsers, StateUser } from "../libs/email";
import * as os from "./../libs/opensearch-lib";
import { getCpocEmail, getSrtEmails } from "./../libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";

// Constants
const region = process.env.region;
const EMAIL_LOOKUP_SECRET_NAME = process.env.emailAddressLookupSecretName;
const APPLICATION_ENDPOINT_URL = process.env.applicationEndpointUrl;
const OS_DOMAIN = process.env.osDomain;
const INDEX_NAMESPACE = process.env.indexNamespace;

if (!region || !EMAIL_LOOKUP_SECRET_NAME || !APPLICATION_ENDPOINT_URL || !OS_DOMAIN || !INDEX_NAMESPACE) {
  throw new Error("Environment variables are not set properly.");
}

export const sesClient = new SESClient({ region: region });

export const handler: Handler<KafkaEvent> = async (event) => {
  console.log("RECEIVED EVENT");
  console.log(JSON.stringify(event, null, 2));
  try {
    const processRecordsPromises = Object.values(event.records)
      .flat()
      .map((rec) => processRecord(rec, EMAIL_LOOKUP_SECRET_NAME, APPLICATION_ENDPOINT_URL));

    await Promise.all(processRecordsPromises);
    console.log("All emails processed successfully.");
  } catch (error) {
    console.error("Error processing email event:", error);
    throw error;
  }
};

export async function processRecord(kafkaRecord: KafkaRecord, emailAddressLookupSecretName: string, applicationEndpointUrl: string) {
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

  if (record?.origin !== "mako") {
    console.log("Kafka event is not of mako origin.  Doing nothing.");
    return;
  }

  await processAndSendEmails(record, id, emailAddressLookupSecretName, applicationEndpointUrl, getAllStateUsers);
}

export async function processAndSendEmails(
  record: any,
  id: string,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
  getAllStateUsers: (state: string) => Promise<StateUser[]>,
) {
  console.log("processAndSendEmails has been called");

  const templates = await getEmailTemplates<typeof record>(record.event, record.authority.toLowerCase());
  if (!templates) {
    console.log(`The kafka record has an event type that does not have email support.  event: ${record.event}.  Doing nothing.`);
    return;
  }

  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers(territory);

  const sec = await getSecret(emailAddressLookupSecretName);

  const item = await os.getItem(OS_DOMAIN!, `${INDEX_NAMESPACE}main`, id);
  console.log("item", JSON.stringify(item, null, 2));

  const cpocEmail = getCpocEmail(item);
  const srtEmails = getSrtEmails(item);
  console.log("cpocEmail", cpocEmail);
  console.log("srtEmails", srtEmails);
  const emails: EmailAddresses = JSON.parse(sec);

  const allStateUsersEmails = allStateUsers.map((user) => user.formattedEmailAddress);

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

    const params = createEmailParams(filledTemplate, emails.sourceEmail, applicationEndpointUrl);
    await sendEmail(params);
  });

  await Promise.all(sendEmailPromises);
}

export function createEmailParams(filledTemplate: any, sourceEmail: string, baseUrl: string): SendEmailCommandInput {
  return {
    Destination: {
      ToAddresses: filledTemplate.to,
      CcAddresses: filledTemplate.cc,
    },
    Message: {
      Body: {
        Html: { Data: filledTemplate.body, Charset: "UTF-8" },
        Text: { Data: htmlToText(filledTemplate.body, htmlToTextOptions(baseUrl)), Charset: "UTF-8" },
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

const htmlToTextOptions = (baseUrl: string): HtmlToTextOptions => ({
  wordwrap: 80, // Standard readable line length
  preserveNewlines: true, // Keeps intended line breaks from HTML
  selectors: [
    {
      selector: "h1",
      options: {
        uppercase: true,
        leadingLineBreaks: 2,
        trailingLineBreaks: 1,
      },
    },
    {
      selector: "p",
      options: {
        leadingLineBreaks: 1,
        trailingLineBreaks: 1,
      },
    },
    {
      selector: "a",
      options: {
        linkBrackets: ["[", "]"],
        baseUrl,
        hideLinkHrefIfSameAsText: true,
      },
    },
  ],
  decodeEntities: true,
  limits: {
    maxInputLength: 50000, // Protect against huge emails
    ellipsis: "...",
    maxBaseElements: 1000,
  },
  longWordSplit: {
    forceWrapOnLimit: false,
    wrapCharacters: ["-", "/"], // Break long words at these characters
  },
});
