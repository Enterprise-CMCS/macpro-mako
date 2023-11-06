import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import { getPackage } from "../libs/package/getPackage";

if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

export const getItemData = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);
    const stateFilter = await getStateFilter(event);
    const result = await getPackage(body.id);

    if (
      stateFilter &&
      !stateFilter.terms.state.includes(
        result._source.state.toLocaleLowerCase()
      )
    ) {
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view this resource" },
      });
    }

    if (!result.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    } else {
      return response<unknown>({
        statusCode: 200,
        body: result,
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
