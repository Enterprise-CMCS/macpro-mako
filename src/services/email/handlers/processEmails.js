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

  const getEmailRecipients = async () => {
    const commandListUsers = new ListUsersCommand({
        UserPoolId: "grue-user-pool",
        // Filter: subFilter,
      });
      try {
        const listUsersResponse = await Cognito.send(commandListUsers);
    
        console.log("listUsers response: ", listUsersResponse);
    
      } catch (error) {
        throw new Error("Error fetching user from Cognito");
      }
    return [
        "k.grue.stateuser@gmail.com",
    ];
};

const createSendEmailCommand = async (event) => {

    try {
    const recipientList = await getEmailRecipients();
    return new SendEmailCommand({
        Source: "kgrue@fearless.tech",
        Destination: {
            ToAddresses: recipientList,
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
} catch (error) {
    throw new Error("Error fetching user from Cognito");
  }
};

export const main = async (event, context, callback) => {
    let response;
    console.log("Received event (stringified):", JSON.stringify(event, null, 4));
    const sendEmailCommand = createSendEmailCommand(event);

    try {
        response = await SES.send(sendEmailCommand);
        console.log("sendEmailCommand response: ", response);
    } catch (err) {
        console.log("Failed to process emails.", err);
    }
    callback(null, "Success");
};
