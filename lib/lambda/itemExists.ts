import { response } from "../libs/api/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "../libs/opensearch-lib";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);
    const packageResult = await os.getItem(
      process.env.osDomain!,
      "main",
      body.id
    );
    if (packageResult?._source) {
      return response({
        statusCode: 200,
        body: { message: "Record found for the given id", exists: true },
      });
    } else {
      return response({
        statusCode: 200,
        body: { message: "No record found for the given id", exists: false },
      });
    }
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
