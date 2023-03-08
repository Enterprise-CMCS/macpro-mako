import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { sendMetricData } from "./cloudwatch-lib";
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
    if (item && item.id) console.log(`Putting item with id: ${item.id}:`);

    const command = new PutItemCommand(params);
    const result = await client.send(command);
    if (item && item.id)
      console.log(
        `Record processed for item: ${item.id}:`,
        JSON.stringify(result, null, 2)
      );

    await sendMetricData({
      Namespace: process.env.namespace,
      MetricData: [
        {
          MetricName: `${tableName}_dynamo_updates`,
          Value: 0,
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("ERROR updating record in dynamodb: ", error);
    await sendMetricData({
      Namespace: process.env.namespace,
      MetricData: [
        {
          MetricName: `${tableName}_dynamo_updates`,
          Value: 1,
        },
      ],
    });
    return;
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
