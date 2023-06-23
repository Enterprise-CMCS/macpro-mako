import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export class SeatoolService {
  #dynamoInstance: DynamoDBClient;

  constructor(dynamoInstance: DynamoDBClient) {
    this.#dynamoInstance = dynamoInstance;
  }

  async getIssues({
    tableName,
    stateCode,
  }: {
    tableName: string;
    stateCode: string;
  }) {
    const data = await this.#dynamoInstance.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "StateAbbreviation-SubmissionDate-index",
        KeyConditionExpression: "StateAbbreviation = :state",

        ExpressionAttributeValues: {
          ":state": { S: stateCode },
        },

        ScanIndexForward: false,
        Limit: 300,
      })
    );

    return data.Items.map((item) => unmarshall(item));
  }
}
