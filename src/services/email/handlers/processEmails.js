import { decode } from "base-64";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  // UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

// import { CognitoUserAttributes } from "shared-types";

const SES = new SESClient({ region: process.env.region });
const Cognito = new CognitoIdentityProviderClient({
  region: process.env.region,
});

const emailsToSend = {
  "initial-submission-default": [{
    "templateBase": "initial-submission-cms",
    "ToAddresses": process.env.osgEmail,
    "CcAddresses": process.env.testingEmail,
  }, {
    "templateBase": "initial-submission-state",
    "ToAddresses": "submitterEmail",
    "CcAddresses": process.env.testingEmail,
  }],
  "initial-submission-chip": [{
    "templateBase": "initial-submission-cms",
    "ToAddresses": process.env.chipEmail,
    "CcAddresses": `${process.env.chipCCList};${process.env.testingEmail}`,
  }, {
    "templateBase": "initial-submission-state",
    "ToAddresses": "submitterEmail",
    "CcAddresses": process.env.testingEmail,
  }],
}

const createSendTemplatedEmailCommand = (data) =>
  new SendTemplatedEmailCommand({
    Source: process.env.emailSource ?? "k.grue@fearless.tech",
    Destination: {
      ToAddresses: data.ToAddresses,
      CcAddresses: data.CcAddresses,
    },
    TemplateData: JSON.stringify({ applicationEndpoint: "onemac.cms.gov", packageDetails: "some details", packageWarnings: "looks like missing attributes are rendering failures... that is not good", ...data }),
    Template: `initial-submission-cms_${process.env.stage}`,
    ConfigurationSetName: process.env.emailConfigSet,
  });

export const main = async (event, context, callback) => {
  let response;
  console.log("Received event (stringified):", JSON.stringify(event, null, 4));
  console.log("the environment parameters are: ", JSON.stringify(process.env, null, 4));

  // Verify we have all the information we need, set defaults where possible

  // decode and transform the incoming events
  const emails = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      if (!REC.value) return;
      const record = { id: decode(REC.key), ...JSON.parse(decode(REC.value)) };
      console.log("here is the decoded record: ", record);
      if (record?.origin !== "micro") return;
      if (!record?.actionType) record.actionType = "initial-submission";
      if (!emailsToSend[`${record.actionType}-default`]) return;
      emailsToSend[`${record.actionType}-default`].forEach((anEmail) => {
        ACC.push({...anEmail, ...record});
      })
    });

    return ACC;
  }, []);
  console.log("the emails to send are: ", emails);

  try {
    await Promise.all(
      emails.map(async (oneEmail) => {
        if (oneEmail.ToAddresses.includes("allStateUsers")) {
          try {
            const commandListUsers = new ListUsersCommand({
              UserPoolId: process.env.cognitoPoolId,
            });
            const listUsersResponse = await Cognito.send(commandListUsers);
            console.log("listUsers response: ", JSON.stringify(listUsersResponse, null, 4));
          } catch (err) {
            console.log("Failed to List users.", err, JSON.stringify(oneEmail, null, 4));
          }
        }

        try {
          const sendTemplatedEmailCommand = createSendTemplatedEmailCommand(oneEmail);
          console.log("the sendTemplatedEmailCommand is: ", JSON.stringify(sendTemplatedEmailCommand, null, 4));
          response = await SES.send(sendTemplatedEmailCommand);
          console.log("sendEmailCommand response: ", JSON.stringify(response, null, 4));
        } catch (err) {
          console.log("Failed to process oneEmail.", err, JSON.stringify(oneEmail, null, 4));
        }
      })
    );
  } catch (err) {
    console.log("Failed to process emails.", err);
  }
  callback(null, "Success");
};
