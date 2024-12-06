import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);
    const exists = await itemExists({
      id: body.id,
    });
    return response({
      statusCode: 200,
      body: {
        message: exists ? "Record found for the given id" : "No record found for the given id",
        exists,
      },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
