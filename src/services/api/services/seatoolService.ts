import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export class SeatoolService {
  #dynamoInstance: DynamoDBClient;

  constructor(dynamoInstance: DynamoDBClient) {
    this.#dynamoInstance = dynamoInstance;
  }

  async getIssues({ tableName }: { tableName: string }) {
    const data = await this.#dynamoInstance.send(
      new ScanCommand({
        TableName: tableName,
      })
    );

    return data.Items.map((item) => unmarshall(item));
  }
}
