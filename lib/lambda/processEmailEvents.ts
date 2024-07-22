import { SNSEvent, Context, Callback } from "aws-lambda";

export const main = async (
  event: SNSEvent,
  context: Context,
  callback: Callback,
): Promise<void> => {
  console.log(
    "Received email event, stringified:",
    JSON.stringify(event, null, 4),
  );

  const message = { simpleMessage: event.Records[0].Sns.Message };
  console.log("Message received from SNS:", message);

  callback(null, "Success");
};
