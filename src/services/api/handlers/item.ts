import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";

import * as os from "../../../libs/opensearch-lib";

if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to get Seatool data
export const getItemData = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);

    const query = {
      query: {
        bool: {
          must: [
            {
              match: {
                _id: body.id,
              },
            },
          ],
        },
      },
    };

    const results = await os.search(process.env.osDomain, "main", query);

    if (!results) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    return response<unknown>({
      statusCode: 200,
      body: results,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getItemData;
