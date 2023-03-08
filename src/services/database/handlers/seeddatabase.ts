import { send, SUCCESS, FAILED } from "cfn-response-async";
import { putItem } from "../../../libs";
import * as items from "../items.json";

exports.handler = async function (event: any, context: any) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: any = SUCCESS;
  try {
    for (let i = 0; i < items.length; i++) {
      console.log(items[i].recordId);
      console.log(items[i].state);
      await putItem({
        tableName: event.ResourceProperties.DynamoTableName,
        item: { PK: items[i].recordId, SK: items[i].state },
      });
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
