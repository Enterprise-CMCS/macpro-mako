import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { KafkaEvent, KafkaRecord, EmailAddresses } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates } from "../libs/email";
import { getAllStateUsers } from "../libs/email/getAllStateUsers";
import * as os from "./../libs/opensearch-lib";
import { EMAIL_CONFIG } from "../libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import pLimit from "p-limit";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

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

interface FilledTemplate {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
}

type UserFields = {
  firstName?: string;
  lastName?: string;
  email?: string;
  reviewTeam?: Array<{ name: string; email: string }>;
};

/** Temporary error represents a retryable failure */
class TemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemporaryError";
  }
}

export const handler: Handler<KafkaEvent> = async (event) => {
  const requiredEnvVars = [
    "emailAddressLookupSecretName",
    "applicationEndpointUrl",
    "osDomain",
    "indexNamespace",
    "region",
    "DLQ_URL",
    "userPoolId",
    "configurationSetName",
    "isDev",
  ] as const;

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  const config: ProcessEmailConfig = {
    emailAddressLookupSecretName: process.env.emailAddressLookupSecretName!,
    applicationEndpointUrl: process.env.applicationEndpointUrl!,
    osDomain: `https://${process.env.osDomain!}`,
    indexNamespace: process.env.indexNamespace,
    region: process.env.region!,
    DLQ_URL: process.env.DLQ_URL!,
    userPoolId: process.env.userPoolId!,
    configurationSetName: process.env.configurationSetName!,
    isDev: process.env.isDev! === "true",
  };

  try {
    const records = Object.values(event.records).flat();
    const results = await Promise.allSettled(records.map((rec) => processRecord(rec, config)));

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some records failed:", failures);
      throw new TemporaryError("Some records failed processing");
    }
  } catch (error) {
    console.error("Permanent failure:", error);

    if (config.DLQ_URL) {
      const sqsClient = new SQSClient({ region: config.region });
      try {
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: config.DLQ_URL,
            MessageBody: JSON.stringify({
              error: (error as Error).message,
              originalEvent: event,
              timestamp: new Date().toISOString(),
            }),
          }),
        );
        console.log("Failed message sent to DLQ");
      } catch (dlqError) {
        console.error("Failed to send to DLQ:", dlqError);
        throw dlqError;
      }
    }
    throw error;
  }
};

async function processRecord(kafkaRecord: KafkaRecord, config: ProcessEmailConfig) {
  const { key, value, timestamp } = kafkaRecord;
  const id: string = decodeBase64WithUtf8(key);

  if (!value) {
    // Tombstone or irrelevant event
    console.log("Tombstone detected. No action taken.");
    return;
  }

  const record = {
    timestamp,
    ...JSON.parse(decodeBase64WithUtf8(value)),
  };

  const origin = record.origin.toLowerCase();

  if (origin !== "mako" && origin !== "seatool" && origin !== "onemac") {
    console.log("Record not from mako origin, no email required.");
    return;
  }

  try {
    await processAndSendEmails(record, id, config);
  } catch (error) {
    console.error("Error processing record:", error);
    throw error;
  }
}

export async function processAndSendEmails(record: any, id: string, config: ProcessEmailConfig) {
  const templates = await getEmailTemplates<typeof record>(
    record.event,
    record.authority.toLowerCase(),
  );

  if (!templates) {
    console.log(
      `The kafka record has an event type that does not have email support.  event: ${record.event}.  Doing nothing.`,
    );
    return;
  }

  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers({
    userPoolId: config.userPoolId,
    state: territory,
  });

  const sec = await getSecret(config.emailAddressLookupSecretName);

  const item = await os.getItem(config.osDomain, `${config.indexNamespace ?? ""}main`, id);

  const cpocEmail = getCpocEmail(item as UserFields);
  const srtEmails = getSrtEmails(item as UserFields);

  const emails: EmailAddresses = JSON.parse(sec);

  const allStateUsersEmails = allStateUsers.map((user) => user.formattedEmailAddress);

  const templateVariables = {
    ...record,
    id,
    applicationEndpointUrl: config.applicationEndpointUrl,
    territory,
    emails: { ...emails, cpocEmail, srtEmails },
    allStateUsersEmails,
  };

  console.log("TEMPLATE VARIABLES:", JSON.stringify(templateVariables, null, 2));

  const limit = pLimit(5);
  const sendEmailPromises = templates.map((template) =>
    limit(async () => {
      const filledTemplate = await template(templateVariables);
      validateEmailTemplate(filledTemplate);
      const params = createEmailParams(
        filledTemplate,
        emails.sourceEmail,
        config.applicationEndpointUrl,
        config.isDev,
      );
      try {
        await sendEmail(params, config.region);
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    }),
  );

  try {
    await Promise.all(sendEmailPromises);
    console.log("All emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
}

function validateEmailTemplate(template: FilledTemplate) {
  const requiredFields = ["to", "subject", "body"] as const;
  for (const field of requiredFields) {
    if (
      !template[field] ||
      (Array.isArray(template[field]) && (template[field] as string[]).length === 0)
    ) {
      throw new Error(`Email template missing required field: ${field}`);
    }
  }
}

function createEmailParams(
  filledTemplate: FilledTemplate,
  sourceEmail: string,
  baseUrl: string,
  isDev: boolean,
): SendEmailCommandInput {
  const toAddresses = isDev ? [`State Submitter <${EMAIL_CONFIG.DEV_EMAIL}>`] : filledTemplate.to;
  const ccAddresses = isDev ? [] : filledTemplate.cc || [];

  return {
    Destination: {
      ToAddresses: toAddresses,
      CcAddresses: ccAddresses,
    },
    Message: {
      Body: {
        Html: { Data: filledTemplate.body, Charset: "UTF-8" },
        Text: {
          Data: htmlToText(filledTemplate.body, htmlToTextOptions(baseUrl)),
          Charset: "UTF-8",
        },
      },
      Subject: { Data: filledTemplate.subject, Charset: "UTF-8" },
    },
    Source: sourceEmail,
    ConfigurationSetName: process.env.configurationSetName,
  };
}

async function sendEmail(params: SendEmailCommandInput, region: string) {
  const sesClient = new SESClient({ region });
  const command = new SendEmailCommand(params);
  const result = await sesClient.send(command);
  console.log("Email sent with status:", result.$metadata.httpStatusCode);
}

function htmlToTextOptions(baseUrl: string): HtmlToTextOptions {
  return {
    wordwrap: 80,
    preserveNewlines: true,
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
        selector: "img",
        options: {
          ignoreHref: true,
          src: true,
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

function getCpocEmail(item: UserFields | undefined): string[] {
  if (!item?.firstName || !item?.lastName || !item?.email) {
    console.warn("Missing required CPOC user fields");
    return [];
  }
  return [`${item.firstName} ${item.lastName} <${item.email}>`];
}

function getSrtEmails(item: UserFields | undefined): string[] {
  if (!item?.reviewTeam || !Array.isArray(item.reviewTeam)) {
    console.warn("No valid review team found or item missing");
    return [];
  }

  return item.reviewTeam
    .filter(
      (reviewer): reviewer is { name: string; email: string } =>
        reviewer && typeof reviewer.name === "string" && typeof reviewer.email === "string",
    )
    .map((reviewer) => `${reviewer.name} <${reviewer.email}>`);
}
