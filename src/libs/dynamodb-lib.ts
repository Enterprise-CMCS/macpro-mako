import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { sendMetricData } from "./cloudwatch-lib";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.region });

export async function putItem({
  tableName,
  item,
}: {
  tableName: string;
  item: { [key: string]: any };
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

const marshallOptions = {
  convertEmptyValues: true, // false, by default.
  removeUndefinedValues: true, // false, by default.
};

// Create the DynamoDB document client.
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions,
});

export const scanTable = async (tableName: string) => {
  const params = {
    TableName: tableName,
  };
  try {
    const raw = await ddbDocClient.send(new ScanCommand(params));
    const data = raw.Items?.map(unmarshall as any);
    return data;
  } catch (err) {
    console.log("Error", err);
    return;
  }
};
