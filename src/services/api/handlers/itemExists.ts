import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body);
    const packageResult = await os.search(process.env.osDomain!, "main", {
      query: {
        match_phrase: {
          id: {
            query: body.id,
          },
        },
      },
    });
    console.log("ASDFASDFASDF");
    console.log(packageResult);
    console.log(JSON.stringify(packageResult, null, 2));

    if (!packageResult?.found) {
      return response({
        statusCode: 200,
        body: { message: "No record found for the given id", exists: false },
      });
    } else {
      return response({
        statusCode: 200,
        body: { message: "Record found for the given id", exists: false },
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
