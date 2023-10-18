import dynamoDb from "./dynamodb-lib";
import AWS from "aws-sdk";

jest.mock("aws-sdk");

AWS.DynamoDB.DocumentClient.mockImplementation(() => {
  return {
    get: () => "get",
    put: () => "put",
    query: () => "query",
    update: () => "update",
    delete: () => "delete",
    scan: () => "scan",
  };
});

it("dynamodb Offline Stub", async () => {
  process.env.IS_OFFLINE = true;
  expect(dynamoDb.get).toBeInstanceOf(Function);
  expect(dynamoDb.put).toBeInstanceOf(Function);
  expect(dynamoDb.query).toBeInstanceOf(Function);
  expect(dynamoDb.update).toBeInstanceOf(Function);
  expect(dynamoDb.delete).toBeInstanceOf(Function);
  expect(dynamoDb.scan).toBeInstanceOf(Function);
});
