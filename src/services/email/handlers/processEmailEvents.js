export const main = async (event, context, callback) => {
    console.log(
        "Received email event, stringified:",
        JSON.stringify(event, null, 4)
    );

    let message;
    if (typeof event.Records[0].Sns.Message === "string")
        message = { "simpleMessage": event.Records[0].Sns.Message };
    else
        message = JSON.parse(event.Records[0].Sns.Message);
    console.log("Message received from SNS:", message);

    callback(null, "Success");
};
