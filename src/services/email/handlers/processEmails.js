import { SESClient, ListConfigurationSetsCommand } from "@aws-sdk/client-ses";

const SES = new SESClient({ region: process.env.region });

export const main = async (event, context, callback) => {
    console.log("Received event (stringified):", JSON.stringify(event, null, 4));

    const response = await SES.send(new ListConfigurationSetsCommand());

    console.log("got this response: ", response);
    callback(null, "Success");
};
