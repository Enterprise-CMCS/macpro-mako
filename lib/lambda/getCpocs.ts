import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

import { handleOpensearchError } from "./utils";

// type GetCpocsBody = object;

export const queryCpocs = async () => {
  const { index, domain } = getDomainAndNamespace("cpocs");

  const query = {
    size: 1000,
    sort: [
      {
        "lastName.keyword": {
          order: "asc",
        },
      },
    ],
  };
  return await os.search(domain, index, query);
};

export const getCpocs = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const result = await queryCpocs();
    if (!result)
      return response({
        statusCode: 400,
        body: { message: "No Cpocs found" },
      });

    return response({
      statusCode: 200,
      body: result,
    });
  } catch (err) {
    return response(handleOpensearchError(err));
  }
};

export const handler = getCpocs;
