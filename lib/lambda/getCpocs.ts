import { handleOpensearchError } from "./utils";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { response } from "libs/handler-lib";

// type GetCpocsBody = object;

export const queryCpocs = async () => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

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
  return await os.search(
    process.env.osDomain,
    `${process.env.indexNamespace ?? ""}cpocs`,
    query,
  );
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
    return response(handleOpensearchError(err))
  }
};

export const handler = getCpocs;
