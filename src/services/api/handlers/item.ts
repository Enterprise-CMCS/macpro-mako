import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";
import { isAuthorized } from "../libs/auth/user";

if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

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

    const stateCode = results.hits[0]._source.state;

    if (isAuthorized(event, stateCode)) {
      return response<unknown>({
        statusCode: 200,
        body: results.hits[0],
      });
    } else {
      return response({
        statusCode: 403,
        body: { message: "User is not authorized to access this resource" },
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
