import { APIGatewayEvent } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { response } from "../libs/handler";

type GetTypesBoby = {
  authorityId: string;
};

export const queryTypes = async (authorityId: string) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  const query = {
    query: {
      bool: {
        must: [
          {
            match: {
              authorityId: authorityId,
            },
          },
        ],
        must_not: [
          {
            match_phrase: {
              name: {
                query: "Do Not Use",
              },
            },
          },
        ],
      },
    },
    sort: [
      {
        "name.keyword": {
          order: "asc",
        },
      },
    ],
  };
  return await os.search(process.env.osDomain, "types", query);
};

export const getTypes = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetTypesBoby;
  try {
    const result = await queryTypes(body.authorityId);
    if (!result)
      return response({
        statusCode: 400,
        body: { message: "No record found for the given authority" },
      });

    return response({
      statusCode: 200,
      body: result,
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getTypes;
