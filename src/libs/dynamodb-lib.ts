import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  marshall,
  unmarshall,
  NativeAttributeValue,
} from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.region });

export async function putItem({
  tableName,
  item,
}: {
  tableName: string;
  item: { [key: string]: NativeAttributeValue };
}) {
  const params = {
    TableName: tableName,
    Item: marshall(item, {
      removeUndefinedValues: true,
    }),
  };

  try {
    const command = new PutItemCommand(params);
    const result = await client.send(command);
    if (result)
      console.log(
        `Record processed for result: `,
        JSON.stringify(result, null, 2)
      );
    return result;
  } catch (error) {
    console.error("ERROR updating record in dynamodb: ", error);
    throw error;
  }
}

export async function getItem({
  tableName,
  key,
}: {
  tableName: string;
  key: {
    [key: string]: NativeAttributeValue;
  };
}) {
  const getItemCommandInput: GetItemCommandInput = {
    TableName: tableName,
    Key: marshall(key),
  };

  const item = (await client.send(new GetItemCommand(getItemCommandInput)))
    .Item;
  if (!item) return null;

  /* Converting the DynamoDB record to a JavaScript object. */
  return unmarshall(item);
}
