import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";
import { response } from "../libs/handler";

type GetSeaTypesBoby = {
  authorityId: string;
  typeId?: string;
};

export const getAllSeaTypesCombined = async (
  authorityId: string,
  typeId?: string
) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  const index = typeId ? "subtypes" : "types";
  const query: any = {
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
  };

  if (typeId) {
    query.query.bool.must.push({
      match: {
        typeId: typeId,
      },
    });
  }

  return await os.search(process.env.osDomain, index, query);
};

export const getSeaTypesCombined = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetSeaTypesBoby;
  try {
    const result = await getAllSeaTypesCombined(body.authorityId, body.typeId);

    if (!result)
      return response({
        statusCode: 400,
        body: { message: "No record found for the given authority" },
      });

    return response({
      statusCode: 200,
      body: body.typeId ? { seaSubTypes: result } : { seaTypes: result },
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getSeaTypesCombined;
