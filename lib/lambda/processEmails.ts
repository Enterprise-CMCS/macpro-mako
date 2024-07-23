import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import * as E from "libs/email/handler-lib";
import { LambdaResponse } from "libs/email/handler-lib";
import type { DecodedRecord } from "libs/email/handler-lib";
import { getBundle } from "libs/email/bundle-lib";
import { buildDestination } from "libs/email/address-lib";
import { buildEmailData } from "libs/email/data-lib";

const SES = new SESClient({ region: process.env.region });

export const handler = E.emailHandler(
  async (
    record: DecodedRecord,
  ): Promise<LambdaResponse[] | { message: string }> => {
    // get the bundle of emails associated with this action
    const emailBundle = getBundle(record, process.env.stage!!) as any;

    // not every event has a bundle, and that's ok!
    if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands)
      return { message: "no eventToEmailMapping found, no email sent" };

    // data is at bundle level since often identical between emails and saves on lookups
    const emailData = await buildEmailData(emailBundle, record);

    const sendResults = await Promise.allSettled(
      emailBundle.emailCommands.map(async (command: any) => {
        try {
          return await SES.send(
            new SendTemplatedEmailCommand({
              Source: process.env.emailSource ?? "kgrue@fearless.tech",
              Destination: buildDestination(command, emailData),
              TemplateData: JSON.stringify(emailData),
              Template: command.Template,
              ConfigurationSetName: process.env.emailConfigSet,
            }),
          );
        } catch (err) {
          console.log(
            "Failed to process the email.",
            err,
            JSON.stringify(command, null, 4),
          );
          return Promise.resolve({ message: err.message });
        }
      }),
    );

    // Transform the sendResults into the expected LambdaResponse format
    const transformedResults = sendResults.map((result) => {
      if (result.status === "fulfilled") {
        return { statusCode: 200, data: result.value };
      } else {
        return { statusCode: 400, data: null, reason: result.reason };
      }
    });

    console.log("sendResults: ", transformedResults);
    return { results: transformedResults } as any;
  },
);
