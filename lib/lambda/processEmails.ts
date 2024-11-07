import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { EmailAddresses, KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { Handler } from "aws-lambda";
import { getEmailTemplates, getAllStateUsers, StateUser } from "../libs/email";
import * as os from "./../libs/opensearch-lib";
import { getCpocEmail, getSrtEmails } from "./../libs/email/content/email-components";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import pLimit from "p-limit";

class TemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemporaryError";
  }
}

export const handler: Handler<KafkaEvent> = async (event) => {
  try {
    const results = await Promise.allSettled(
      Object.values(event.records)
        .flat()
        .map((rec) =>
          processRecord(
            rec,
            process.env.emailAddressLookupSecretName!,
            process.env.applicationEndpointUrl!,
            process.env.osDomain!,
            process.env.indexNamespace!,
            process.env.region!,
          ),
        ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some records failed:", failures);
      // Throw TemporaryError if we want to retry the batch
      throw new TemporaryError("Some records failed processing");
    }
  } catch (error) {
    if (error instanceof TemporaryError) {
      throw error; // Retry
    }
    console.error("Permanent failure:", error);
    // Handle permanent failures
  }
};

export async function processRecord(
  kafkaRecord: KafkaRecord,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
  osDomain: string,
  indexNamespace: string,
  region: string,
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

  if (record?.origin !== "mako") {
    console.log("Kafka event is not of mako origin.  Doing nothing.");
    return;
  }

  await processAndSendEmails(
    record,
    id,
    emailAddressLookupSecretName,
    applicationEndpointUrl,
    osDomain,
    indexNamespace,
    region,
    getAllStateUsers,
  );
}

export async function processAndSendEmails(
  record: any,
  id: string,
  emailAddressLookupSecretName: string,
  applicationEndpointUrl: string,
  osDomain: string,
  indexNamespace: string,
  region: string,
  getAllStateUsers: (state: string) => Promise<StateUser[]>,
) {
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
  const allStateUsers = await getAllStateUsers(territory);

  const sec = await getSecret(emailAddressLookupSecretName);

  const item = await os.getItem(osDomain, `${indexNamespace}main`, id);

  const cpocEmail = getCpocEmail(item);
  const srtEmails = getSrtEmails(item);
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

  const limit = pLimit(5); // Limit concurrent emails
  const sendEmailPromises = templates.map((template) =>
    limit(async () => {
      const filledTemplate = await template(templateVariables);
      const params = createEmailParams(filledTemplate, emails.sourceEmail, applicationEndpointUrl);
      await sendEmail(params, region);
    }),
  );

  await Promise.all(sendEmailPromises);
}

export function createEmailParams(
  filledTemplate: any,
  sourceEmail: string,
  baseUrl: string,
): SendEmailCommandInput {
  return {
    Destination: {
      ToAddresses: filledTemplate.to,
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
  };
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
    maxInputLength: 50000, // Protect against huge emails
    ellipsis: "...",
    maxBaseElements: 1000,
  },
  longWordSplit: {
    forceWrapOnLimit: false,
    wrapCharacters: ["-", "/"], // Break long words at these characters
  },
});
