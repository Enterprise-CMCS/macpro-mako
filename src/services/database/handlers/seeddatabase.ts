import { send, SUCCESS, FAILED } from "cfn-response-async";
import { putItem } from "../../../libs";
import { items } from "../items";

exports.handler = async function (event, context) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: any = SUCCESS;
  try {
    console.log("lol");
    await putItem({
      tableName: event.ResourceProperties.DynamoTableName,
      item: items,
    });
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static1");
  }
};
