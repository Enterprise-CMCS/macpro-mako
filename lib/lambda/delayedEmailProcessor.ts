import { SQSEvent } from "aws-lambda";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { EmailAddresses, KafkaRecord, Events } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { getEmailTemplates, getAllStateUsers } from "libs/email";
import * as os from "libs/opensearch-lib";
import { EMAIL_CONFIG, getCpocEmail, getSrtEmails } from "libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import pLimit from "p-limit";
import { getOsNamespace } from "libs/utils";

interface ProcessEmailConfig {
  emailAddressLookupSecretName: string;
  applicationEndpointUrl: string;
  osDomain: string;
  indexNamespace?: string;
  region: string;
  DLQ_URL: string;
  userPoolId: string;
  configurationSetName: string;
  isDev: boolean;
}

/**
 * Main SQS handler: parse each SQS message to get the original Kafka payload,
 * then do OpenSearch lookups and send emails.
 */
export const handler = async (event: SQSEvent) => {
  const requiredEnvVars = [
    "emailAddressLookupSecretName",
    "applicationEndpointUrl",
    "osDomain",
    "region",
    "DLQ_URL",
    "userPoolId",
    "isDev",
    "configurationSetName",
  ] as const;

  const missing = requiredEnvVars.filter((e) => !process.env[e]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const emailConfig: ProcessEmailConfig = {
    emailAddressLookupSecretName: process.env.emailAddressLookupSecretName!,
    applicationEndpointUrl: process.env.applicationEndpointUrl!,
    osDomain: `https://${process.env.osDomain!}`,
    indexNamespace: process.env.indexNamespace,
    region: process.env.region!,
    DLQ_URL: process.env.DLQ_URL!,
    userPoolId: process.env.userPoolId!,
    configurationSetName: process.env.configurationSetName!,
    isDev: process.env.isDev === "true",
  };

  for (const sqsRecord of event.Records) {
    try {
      const kafkaRecord = JSON.parse(sqsRecord.body) as KafkaRecord;

      const { key, value } = kafkaRecord; // sanity check
      if (!key || !value) {
        console.log("No key/value present. Possibly a tombstone or invalid data.");
        continue;
      }

      await processRecord(kafkaRecord, emailConfig);
    } catch (error) {
      console.error("Error processing SQS record:", error);
      throw error; // Let Lambda handle retries / DLQ
    }
  }
};

/**
 * Takes a KafkaRecord, decodes data, and triggers the actual
 * "processAndSendEmails" function.
 */
async function processRecord(kafkaRecord: KafkaRecord, config: ProcessEmailConfig) {
  console.log("Processing record from SQS => KafkaRecord:", JSON.stringify(kafkaRecord, null, 2));

  const { key, value, timestamp } = kafkaRecord;
  const id: string = decodeBase64WithUtf8(key); // decode the key

  if (!value) {
    console.log("Tombstone detected, nothing to do.");
    return;
  }

  const recordBody = JSON.parse(decodeBase64WithUtf8(value));

  // Example check: only process if origin is "mako"
  if (recordBody.origin !== "mako") {
    console.log("Kafka event is not of 'mako' origin. Skipping.");
    return;
  }

  // Combine the original fields for passing to the next step
  const eventObj = {
    ...recordBody,
    timestamp,
  };

  try {
    await processAndSendEmails(eventObj as Events[keyof Events], id, config);
  } catch (error) {
    console.error("Error in processAndSendEmails:", error);
    throw error;
  }
}

/**
 * Main email processing function:
 * 1. Retrieves the relevant email templates
 * 2. Loads user data & secrets
 * 3. Queries OpenSearch for the item
 * 4. Renders & sends emails with concurrency limiting
 */
export async function processAndSendEmails(
  record: Events[keyof Events],
  id: string,
  config: ProcessEmailConfig,
) {
  const templates = await getEmailTemplates(record);
  if (!templates) {
    console.log(`No email templates for event '${record.event}'. Skipping.`);
    return;
  }

  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers({
    userPoolId: config.userPoolId,
    state: territory,
  });

  const secretString = await getSecret(config.emailAddressLookupSecretName);
  const emails: EmailAddresses = JSON.parse(secretString);

  // Retrieve package from OpenSearch
  const item = await os.getItem(config.osDomain, getOsNamespace("main"), id);
  if (!item?.found || !item?._source) {
    console.log(`OpenSearch item not found for id: ${id}. Skipping.`);
    return;
  }

  const cpocEmail = getCpocEmail(item);
  const srtEmails = getSrtEmails(item);

  // Gather variables to pass into templates
  const templateVariables = {
    ...record,
    id,
    territory,
    applicationEndpointUrl: config.applicationEndpointUrl,
    emails: {
      ...emails,
      cpocEmail,
      srtEmails,
    },
    allStateUsersEmails: allStateUsers.map((user) => user.formattedEmailAddress),
  };

  console.log("Template variables:", JSON.stringify(templateVariables, null, 2));

  // Concurrency limit for sending
  const limit = pLimit(5);

  const sendTasks = templates.map((tmpl) =>
    limit(async () => {
      const filledTemplate = await tmpl(templateVariables);
      validateEmailTemplate(filledTemplate);
      const params = createEmailParams(
        filledTemplate,
        emails.sourceEmail,
        config.applicationEndpointUrl,
        config.isDev,
        config.configurationSetName,
      );
      return sendEmail(params, config.region);
    }),
  );

  try {
    await Promise.all(sendTasks);
    console.log("All emails sent successfully for id:", id);
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
}

/**
 * Ensure the template has the necessary fields before sending.
 */
export function validateEmailTemplate(tmpl: {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
}) {
  const requiredFields: (keyof typeof tmpl)[] = ["to", "subject", "body"];
  const missing = requiredFields.filter((f) => !tmpl[f]);
  if (missing.length > 0) {
    throw new Error(`Email template missing fields: ${missing.join(", ")}`);
  }
}

/**
 * Create the SES params. Optionally add BCC in dev.
 */
export function createEmailParams(
  filledTemplate: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
  },
  sourceEmail: string,
  baseUrl: string,
  isDev: boolean,
  configurationSetName?: string,
): SendEmailCommandInput {
  return {
    Destination: {
      ToAddresses: filledTemplate.to,
      CcAddresses: filledTemplate.cc || [],
      BccAddresses: isDev ? [`Dev BCC <${EMAIL_CONFIG.DEV_EMAIL}>`] : [],
    },
    Message: {
      Body: {
        Html: {
          Data: filledTemplate.body,
          Charset: "UTF-8",
        },
        Text: {
          Data: htmlToText(filledTemplate.body, htmlToTextOptions(baseUrl)),
          Charset: "UTF-8",
        },
      },
      Subject: {
        Data: filledTemplate.subject,
        Charset: "UTF-8",
      },
    },
    Source: sourceEmail,
    ConfigurationSetName: configurationSetName,
  };
}

/**
 * Send the email via AWS SES.
 */
export async function sendEmail(params: SendEmailCommandInput, region: string) {
  const sesClient = new SESClient({ region });
  const command = new SendEmailCommand(params);
  const result = await sesClient.send(command);
  console.log("SES send result:", result);
  return result;
}

/**
 * Options for converting HTML to text
 */
export function htmlToTextOptions(baseUrl: string): HtmlToTextOptions {
  return {
    wordwrap: 80,
    preserveNewlines: true,
    selectors: [
      {
        selector: "h1",
        options: { uppercase: true, leadingLineBreaks: 2, trailingLineBreaks: 1 },
      },
      {
        selector: "img",
        options: { ignoreHref: true, src: true },
      },
      {
        selector: "p",
        options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
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
    limits: {
      maxInputLength: 50000,
      ellipsis: "...",
      maxBaseElements: 1000,
    },
    longWordSplit: {
      forceWrapOnLimit: false,
      wrapCharacters: ["-", "/"],
    },
  };
}
