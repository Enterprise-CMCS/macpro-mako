import { SESClient, ListConfigurationSetsCommand, ListIdentitiesCommand } from "@aws-sdk/client-ses";

const createListIdentitiesCommand = () =>
    new ListIdentitiesCommand({ IdentityType: "EmailAddress", MaxItems: 10 });

const SES = new SESClient({ region: process.env.region });

export const main = async (event, context, callback) => {
    let response;
    console.log("Received event (stringified):", JSON.stringify(event, null, 4));
    const listIdentitiesCommand = createListIdentitiesCommand();

    try {
        response = await SES.send(listIdentitiesCommand);
        console.log("listIdentitiesCommand response: ", response);

        response = await SES.send(new ListConfigurationSetsCommand({ NextToken: "", MaxItems: 10 }));
        console.log("ListConfigurationSetsCommand response: ", response);
    } catch (err) {
        console.log("Failed to list identities.", err);
    }
    callback(null, "Success");
};
