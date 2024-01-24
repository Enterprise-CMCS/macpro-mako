export const main = async (event, context, callback) => {
    console.log("Received event (stringified):", JSON.stringify(event, null, 4));
    callback(null, "Success");
};
