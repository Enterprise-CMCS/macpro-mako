import { handleOpensearchError } from "./utils";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { response } from "libs/handler-lib";
import { getDomainAndNamespace } from "libs/utils";

type GetTypesBody = {
  authorityId: string;
};

export const queryTypes = async (authorityId: string) => {
  const { index, domain } = getDomainAndNamespace("types");

  const query = {
    size: 200,
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
  return await os.search(domain, index, query);
};

export const getTypes = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetTypesBody;
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
    return response(handleOpensearchError(err));
  }
};

export const handler = getTypes;
