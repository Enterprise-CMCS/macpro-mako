import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    // UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// import { CognitoUserAttributes } from "shared-types";

const SES = new SESClient({ region: process.env.region });
const Cognito = new CognitoIdentityProviderClient({
    region: process.env.region,
});

const createSendEmailCommand = async (event) =>
    new SendEmailCommand({
        Source: "kgrue@fearless.tech",
        Destination: {
            ToAddresses: [
                "k.grue.stateuser@gmail.com",
            ],
        },
        Message: {
            Subject: {
                Data: event.subject ?? "Subject Required",
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: "Body Text",
                    Charset: "UTF-8",
                },
                Html: {
                    Data: "<p>HTML body text</p><p>yup</p>",
                    Charset: "UTF-8",
                },
            },
        },
        ConfigurationSetName: process.env.emailConfigSet,
    });

export const main = async (event, context, callback) => {
    let response;
    console.log("Received event (stringified):", JSON.stringify(event, null, 4));
    const commandListUsers = new ListUsersCommand({
        UserPoolId: "grue-user-pool",
        // Filter: subFilter,
    });

    const sendEmailCommand = createSendEmailCommand(event);

    try {
        const listUsersResponse = await Cognito.send(commandListUsers);
        console.log("listUsers response: ", listUsersResponse);

        response = await SES.send(sendEmailCommand);
        console.log("sendEmailCommand response: ", response);
    } catch (err) {
        console.log("Failed to process emails.", err);
    }
    callback(null, "Success");
};
