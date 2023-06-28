import { Handler } from "aws-lambda";
// import { deleteItem } from "../../../libs";

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  try {
    console.log("hey ma");
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }
  } catch (error) {
    console.error(error);
    throw (error);
  }
};
