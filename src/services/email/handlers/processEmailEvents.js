export const main = async (event, context, callback) => {
    console.log(
        "Received email event, stringified:",
        JSON.stringify(event, null, 4)
    );

    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log("Message received from SNS:", message);

    callback(null, "Success");
};
