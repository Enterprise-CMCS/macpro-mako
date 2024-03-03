import { APIGatewayEvent } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { response } from "../libs/handler";

type GetSubTypesBoby = {
  authorityId: string;
  typeIds: string[];
};

export const querySubTypes = async (authorityId: string, typeIds: string[]) => {
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
          {
            terms: {
              typeId: typeIds,
            },
          }
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
  };

  return await os.search(process.env.osDomain, "subtypes", query);
};

export const getSubTypes = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetSubTypesBoby;
  try {
    const result = await querySubTypes(body.authorityId, body.typeIds);

    if (!result)
      return response({
        statusCode: 400,
        body: { message: "No record found for the given authority" },
      });

    return response({
      statusCode: 200,
      body: result
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getSubTypes;
