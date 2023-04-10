// import * as dynamodb from "../../../libs/dynamodb-lib";

exports.handler = async (event, context) => {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  // const responseData = {};
  // let responseStatus = "SUCCESS";
  try {
    console.log("Putting test data...");
    await new Promise(r => setTimeout(r, 5000));
  } catch (error) {
    console.error(error);
  } finally {
    console.log("finally");
  }
};
