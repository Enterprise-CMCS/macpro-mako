import { send, SUCCESS, FAILED } from "cfn-response-async";
import { putItem } from "../../../libs";
import * as items from "../items.json";

exports.handler = async function (event: any, context: any) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: any = SUCCESS;
  try {
    for await (const item of items) {
      console.log({ item });
      putItem({
        tableName: event.ResourceProperties.DynamoTableName,
        item: { PK: item.recordId, SK: item.state },
      });
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
