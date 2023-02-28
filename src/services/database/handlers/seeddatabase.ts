const AWS = require("@aws-sdk/client-dynamodb");
const response = require("cfn-response");
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = function (event, context) {
  console.log(JSON.stringify(event, null, 2));
  var params = {
    TableName: event.ResourceProperties.DynamoTableName,
    Item: {
      id: "abc123",
    },
  };
  docClient.put(params, function (err, data) {
    if (err) {
      response.send(event, context, "FAILED", {});
    } else {
      response.send(event, context, "SUCCESS", {});
    }
  });
};
