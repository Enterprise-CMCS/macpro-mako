import { send, SUCCESS, FAILED } from "cfn-response-async";
import { putItem } from "../../../libs";
import axios from "axios";

exports.handler = async function (event: any, context: any) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: any = SUCCESS;
  try {
    const url = "https://jsonplaceholder.typicode.com/posts";
    const response = await axios.get(url);
    const items = response.data.map((item: any) => ({
      PK: item.id,
      SK: item.title,
      body: item.body,
    }));
    for await (const item of items) {
      await putItem({
        tableName: event.ResourceProperties.DynamoTableName,
        item,
      });
    }
  } catch (error) {
    console.error(error);
    responseStatus = FAILED;
  } finally {
    await send(event, context, responseStatus, responseData, "static");
  }
};
