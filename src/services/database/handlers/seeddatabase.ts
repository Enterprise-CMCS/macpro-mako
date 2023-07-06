import { send, SUCCESS, FAILED } from "cfn-response-async";
import { putItem } from "../../../libs";
import * as items from "../src/reference/items.json";
import type { CloudFormationCustomResourceEvent, Context } from "aws-lambda";

declare type ResponseStatus = typeof SUCCESS | typeof FAILED;

exports.handler = async function (
  event: CloudFormationCustomResourceEvent,
  context: Context
) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    for await (const item of items) {
      putItem({
        tableName: event.ResourceProperties.DynamoTableName,
        item: { id: item.id, state: item.state },
      });
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
