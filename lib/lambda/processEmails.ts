import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as EmailLib from "../libs/email";

const SES = new SESClient({ region: process.env.REGION });
const S3 = new S3Client({ region: process.env.REGION });

// Helper function to prepare data for S3
const prepareS3Data = (
  result: any,
  command: any,
  status: string,
  error?: string,
) => ({
  emailId: result?.MessageId || "unknown",
  eventType: error ? "ERROR" : "SEND",
  timestamp: new Date().toISOString(),
  destination: command.Destination,
  template: command.Template,
  status,
  ...(error && { error }),
});

// Helper function to write data to S3
const writeToS3 = async (data: any, key: string) => {
  await S3.send(
    new PutObjectCommand({
      Bucket: process.env.EMAIL_DATA_BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    }),
  );
};

export const handler = E.emailHandler(
  async (
    record: EmailLib.DecodedRecord,
  ): Promise<EmailLib.LambdaResponse[] | { message: string }> => {
    const emailBundle = EmailLib.getBundle(record, process.env.STAGE!!) as any;

    if (!emailBundle || !!emailBundle?.message || !emailBundle?.emailCommands) {
      return { message: "no eventToEmailMapping found, no email sent" };
    }

    const emailData = await EmailLib.buildEmailData(emailBundle, record);

    const sendResults = await Promise.allSettled(
      emailBundle.emailCommands.map(async (command: any) => {
        try {
          const result = await SES.send(
            new SendTemplatedEmailCommand({
              Source: process.env.EMAIL_SOURCE ?? "kgrue@fearless.tech",
              Destination: EmailLib.buildDestination(command, emailData),
              TemplateData: JSON.stringify(emailData),
              Template: command.Template,
              ConfigurationSetName: process.env.EMAIL_CONFIG_SET,
            }),
          );

          const s3Data = prepareS3Data(result, command, "Success");
          await writeToS3(s3Data, `email_events/${result.MessageId}.json`);

          return { statusCode: 200, data: result };
        } catch (err) {
          console.log(
            "Failed to process the email.",
            err,
            JSON.stringify(command, null, 4),
          );

          const s3ErrorData = prepareS3Data(
            null,
            command,
            "Failed",
            err.message,
          );
          await writeToS3(
            s3ErrorData,
            `email_events/${new Date().getTime()}_error.json`,
          );

          return { statusCode: 400, data: null, reason: err.message };
        }
      }),
    );

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
