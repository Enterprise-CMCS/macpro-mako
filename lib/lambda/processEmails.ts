import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { EmailAddresses, KafkaEvent, KafkaRecord, Events } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler, SQSEvent } from "aws-lambda";
import { getEmailTemplates, getAllStateUsers } from "libs/email";
import * as os from "libs/opensearch-lib";
import { EMAIL_CONFIG, getCpocEmail, getSrtEmails } from "libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import pLimit from "p-limit";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getOsNamespace } from "libs/utils";

export class TemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemporaryError";
  }
}

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

export const handler: Handler<KafkaEvent | SQSEvent> = async (event) => {
  const requiredEnvVars = [
    "emailAddressLookupSecretName",
    "applicationEndpointUrl",
    "osDomain",
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

  console.log("right before if in event check");
  if ("records" in event) {
    console.log("right inside if in event check");
    const sqsClient = new SQSClient({ region: process.env.region! });

    try {
      await Promise.all(
        Object.values(event.records)
          .flat()
          .map((record) =>
            sqsClient.send(
              new SendMessageCommand({
                QueueUrl: process.env.DELAY_QUEUE_URL!,
                MessageBody: JSON.stringify(record),
              }),
            ),
          ),
      );
    } catch (err: unknown) {
      console.log("one of the event records failed, here is why: ", err);
    }

    return;
  }

  // Process SQS messages
  for (const record of event.Records) {
    const kafkaRecord = JSON.parse(record.body) as KafkaRecord;
    await processRecord(kafkaRecord, emailConfig);
  }
};

export async function processRecord(kafkaRecord: KafkaRecord, config: ProcessEmailConfig) {
  console.log("processRecord called with kafkaRecord: ", JSON.stringify(kafkaRecord, null, 2));
  const { key, value, timestamp } = kafkaRecord;
  if (typeof key !== "string") {
    console.log("key is not a string ", JSON.stringify(key, null, 2));
    throw new Error("Key is not a string");
  }
  const id: string = decodeBase64WithUtf8(key);

  if (!value) {
    console.log("Tombstone detected. Doing nothing for this event");
    return;
  }

  const record = {
    timestamp,
    ...JSON.parse(decodeBase64WithUtf8(value)),
  };
  console.log("record: ", JSON.stringify(record, null, 2));

  if (record.origin !== "mako") {
    console.log("Kafka event is not of mako origin. Doing nothing.");
    return;
  }

  try {
    console.log("Config:", JSON.stringify(config, null, 2));
    await processAndSendEmails(record, id, config);
  } catch (error) {
    console.error(
      "Error processing record: { record, id, config }",
      JSON.stringify({ record, id, config }, null, 2),
    );
    throw error;
  }
}

export function validateEmailTemplate(template: any) {
  const requiredFields = ["to", "subject", "body"];
  const missingFields = requiredFields.filter((field) => !template[field]);

  if (missingFields.length > 0) {
    throw new Error(`Email template missing required fields: ${missingFields.join(", ")}`);
  }
}

export function createEmailParams(
  filledTemplate: any,
  sourceEmail: string,
  baseUrl: string,
  isDev: boolean,
): SendEmailCommandInput {
  const params = {
    Destination: {
      ToAddresses: filledTemplate.to,
      CcAddresses: filledTemplate.cc,
      BccAddresses: isDev ? [`State Submitter <${EMAIL_CONFIG.DEV_EMAIL}>`] : [], // this is so emails can be tested in dev as they should have the correct recipients
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
  const sesClient = new SESClient({ region: region });
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

export async function processAndSendEmails(
  record: Events[keyof Events],
  id: string,
  config: ProcessEmailConfig,
) {
  const templates = await getEmailTemplates(record);

  if (!templates) {
    console.log(
      `The kafka record has an event type that does not have email support. event: ${record.event}. Doing nothing.`,
    );
    return;
  }

  const territory = id.slice(0, 2);
  const allStateUsers = await getAllStateUsers({
    userPoolId: config.userPoolId,
    state: territory,
  });

  const sec = await getSecret(config.emailAddressLookupSecretName);

  const item = await os.getItem(config.osDomain, getOsNamespace("main"), id);
  if (!item?.found || !item?._source) {
    console.log(`The package was not found for id: ${id}. Doing nothing.`);
    return;
  }

  const cpocEmail = [...getCpocEmail(item)];
  const srtEmails = [...getSrtEmails(item)];

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

  console.log("Template variables:", JSON.stringify(templateVariables, null, 2));
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
