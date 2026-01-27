import { APIGatewayEvent } from "aws-lambda";
import { checkIdentifierUsage } from "libs/api/package/checkIdentifierUsage";
import { response } from "libs/handler-lib";

import { nonAuthenticatedMiddy } from "./middleware/handlers";

/**
 * Handler for checking identifier usage
 * GET /checkIdentifierUsage?id={identifier}
 *
 * Returns:
 * - 200: {"inUse": false} if identifier is available
 * - 200: {"inUse": true, "system": "<origin>"} if identifier is in use
 * - 400: Error if id parameter is missing
 * - 500: Error on internal server error
 */
export const checkIdentifierUsageHandler = async (event: APIGatewayEvent) => {
  const identifier = event.queryStringParameters?.id;

  if (!identifier) {
    return response(
      {
        statusCode: 400,
        body: { message: "Missing required parameter: id" },
      },
      { disableCors: false },
    );
  }

  try {
    const result = await checkIdentifierUsage(identifier);

    if (result.exists) {
      return response(
        {
          statusCode: 200,
          body: {
            inUse: true,
            system: result.origin,
          },
        },
        { disableCors: false },
      );
    }

    return response(
      {
        statusCode: 200,
        body: {
          inUse: false,
        },
      },
      { disableCors: false },
    );
  } catch (error) {
    console.error("Error in checkIdentifierUsage:", error);
    return response(
      {
        statusCode: 500,
        body: { message: "Internal server error" },
      },
      { disableCors: false },
    );
  }
};

export const handler = nonAuthenticatedMiddy({
  opensearch: true,
  body: false,
}).handler(checkIdentifierUsageHandler);
