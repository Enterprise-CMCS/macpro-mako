import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { isAuthorized } from "../libs/auth/user";
import * as os from "./../../../libs/opensearch-lib";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to get Seatool data
export const getSearchData = async (event: APIGatewayEvent) => {
  try {
    // Retrieve the state code from the path parameters
    const stateCode = event.pathParameters?.stateCode;

    // Check if stateCode is provided
    if (!stateCode) {
      return response({
        statusCode: 400,
        body: { message: "State code is missing" },
      });
    }

    if (!isAuthorized(event, stateCode)) {
      return response({
        statusCode: 403,
        body: { message: "User is not authorized to access this resource" },
      });
    }
    const stateMatcher = {
      match: {
        state: stateCode,
      },
    };

    let query: any = {};
    if (event.body) {
      query = JSON.parse(event.body);
    }

    query.query = query?.query || {};
    query.query.bool = query.query?.bool || {};
    query.query.bool.must = query.query.bool?.must || [];
    query.query.bool.must.push(stateMatcher);

    query.from = query.from || 0;
    query.size = query.size || 100;

    console.log("Sending query, built as follow:");
    console.log(JSON.stringify(query, null, 2));

    const results = await os.search(process.env.osDomain, "main", query);

    if (!results) {
      return response({
        statusCode: 404,
        body: { message: "No Seatool data found for the provided state code" },
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

export const handler = getSearchData;
