import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { EmailAddresses, KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates, getAllStateUsers } from "libs/email";
import * as os from "./../libs/opensearch-lib";
import { EMAIL_CONFIG } from "libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import pLimit from "p-limit";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Document as CpocUser } from "shared-types/opensearch/cpocs";

class TemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemporaryError";
  }
}

interface ProcessEmailConfig {
  emailAddressLookupSecretName: string;
  applicationEndpointUrl: string;
  osDomain: string;
  indexNamespace: string;
  region: string;
  DLQ_URL: string;
  userPoolId: string;
  configurationSetName: string;
  isDev: boolean;
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

  const emailAddressLookupSecretName = process.env.emailAddressLookupSecretName!;
  const applicationEndpointUrl = process.env.applicationEndpointUrl!;
  const osDomain = process.env.osDomain!;
  const indexNamespace = process.env.indexNamespace!;
  const region = process.env.region!;
  const DLQ_URL = process.env.DLQ_URL!;
  const userPoolId = process.env.userPoolId!;
  const configurationSetName = process.env.configurationSetName!;
  const isDev = process.env.isDev!;
  const config: ProcessEmailConfig = {
    emailAddressLookupSecretName,
    applicationEndpointUrl,
    osDomain: `https://${osDomain}`,
    indexNamespace,
    region,
    DLQ_URL,
    userPoolId,
    configurationSetName,
    isDev: isDev === "true",
  };

  try {
    const results = await Promise.allSettled(
      Object.values(event.records)
        .flat()
        .map((rec) => processRecord(rec, config)),
    );

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
              error: error.message,
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

export async function processRecord(kafkaRecord: KafkaRecord, config: ProcessEmailConfig) {
  const { key, value, timestamp } = kafkaRecord;

  const id: string = decodeBase64WithUtf8(key);

  if (!value) {
    console.log("Tombstone detected. Doing nothing for this event");
    return;
  }
  console.log("Kafka record value:", JSON.stringify(value, null, 2));
  const record = {
    timestamp,
    ...JSON.parse(decodeBase64WithUtf8(value)),
  };

  console.log("Kafka record:", JSON.stringify(record, null, 2));

  // Validate record structure based on origin
  if (record.origin === "seatool") {
    // Validate seatool record structure
    const requiredFields = ["event", "authority"];
    const missingFields = requiredFields.filter((field) => !record[field]);
    if (missingFields.length > 0) {
      console.error(`Invalid seatool record: missing fields ${missingFields.join(", ")}`);
      return;
    }
  } else if (record.origin === "mako") {
    // Validate mako record structure
    const requiredFields = ["event", "authority"];
    const missingFields = requiredFields.filter((field) => !record[field]);
    if (missingFields.length > 0) {
      console.error(`Invalid mako record: missing fields ${missingFields.join(", ")}`);
      return;
    }
  } else {
    console.log("Kafka event is not of mako or seatool origin. Doing nothing.");
    console.log("Kafka event", JSON.stringify(record, null, 2));
    return;
  }

  try {
    console.log("Processing record:", JSON.stringify(record, null, 2));
    console.log("Config:", JSON.stringify(config, null, 2));
    await processAndSendEmails(record, id, config);
  } catch (error) {
    console.error("Error processing record:", JSON.stringify(error, null, 2));
    throw error;
  }
}

function validateEmailTemplate(template: any) {
  const requiredFields = ["to", "subject", "body"];
  const missingFields = requiredFields.filter((field) => !template[field]);

  if (missingFields.length > 0) {
    throw new Error(`Email template missing required fields: ${missingFields.join(", ")}`);
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

  const item = await os.getItem(config.osDomain, `${config.indexNamespace}main`, id);

  const cpocEmail = getCpocEmail(item as unknown as CpocUser);
  const srtEmails = getSrtEmails(item as any);
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
  const limit = pLimit(5); // Limit concurrent emails
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
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
}

export function createEmailParams(
  filledTemplate: any,
  sourceEmail: string,
  baseUrl: string,
  isDev: boolean,
): SendEmailCommandInput {
  const toAddresses = isDev ? [`State Submitter <${EMAIL_CONFIG.DEV_EMAIL}>`] : filledTemplate.to;
  console.log("toAddresses:", toAddresses);
  const params = {
    Destination: {
      ToAddresses: toAddresses,
      CcAddresses: filledTemplate.cc,
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
  console.log("Email params:", JSON.stringify(params, null, 2));
  return params;
}

export async function sendEmail(params: SendEmailCommandInput, region: string): Promise<any> {
  const sesClient = new SESClient({ region });
  console.log("sendEmail called with params:", JSON.stringify(params, null, 2));

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
});

function getCpocEmail(item: CpocUser | undefined): string[] {
  try {
    if (!item) return [];
    const source = (item as any)?._source || item;
    const { firstName, lastName, email } = source; // Ensure these fields exist

    if (!firstName || !lastName || !email) {
      console.warn("Missing required CPOC user fields:", { firstName, lastName, email });
      return [];
    }

    return [`${firstName} ${lastName} <${email}>`];
  } catch (e) {
    console.error("Error getting CPOC email", JSON.stringify(e, null, 2));
    return [];
  }
}

function getSrtEmails(item: Document | undefined): string[] {
  try {
    if (!item) {
      console.warn("No item provided to getSrtEmails");
      return [];
    }

    const source = (item as any)?._source || item;
    const reviewTeam = source?.reviewTeam; // Ensure this is an array

    if (!reviewTeam || !Array.isArray(reviewTeam)) {
      console.warn("No valid review team found:", {
        hasSource: Boolean(source),
        reviewTeamType: typeof reviewTeam,
        isArray: Array.isArray(reviewTeam),
      });
      return [];
    }

    return reviewTeam
      .filter((reviewer: any) => {
        if (!reviewer?.name || !reviewer?.email) {
          console.warn("Invalid reviewer entry:", reviewer);
          return false;
        }
        return true;
      })
      .map((reviewer: { name: string; email: string }) => `${reviewer.name} <${reviewer.email}>`);
  } catch (e) {
    console.error("Error getting SRT emails:", e);
    return [];
  }
}
