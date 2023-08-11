import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";
import { getStateFilter } from "../libs/auth/user";

if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

export const getItemData = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);

    let query: any = {};
    query = {
      query: {
        bool: {
          must: [
            {
              ids: {
                values: [body.id],
              },
            },
          ],
        },
      },
    };
    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      query.query.bool.must.push(stateFilter);
    }

    const results = await os.search(process.env.osDomain, "main", query);

    if (!results) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    } else {
      return response<unknown>({
        statusCode: 200,
        body: results.hits[0],
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

export const handler = getItemData;
