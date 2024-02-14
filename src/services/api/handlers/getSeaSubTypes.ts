import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";
import { response } from "../libs/handler";
import { opensearch } from "shared-types";

type GetSeaSubTypeBody = {
  authorityId: string;
  typeId: string;
};

export const getAllSeaSubTypes = async (
  authorityId: string,
  typeId: string
) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  return (await os.search(process.env.osDomain, "subtypes", {
    query: {
      bool: {
        must: [
          {
            match: {
              authorityId: authorityId,
            },
          },
          {
            match: {
              typeId: typeId,
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
  })) as opensearch.subtypes.Response;
};

export const getSeaSubTypes = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetSeaSubTypeBody;
  try {
    const result = await getAllSeaSubTypes(body.authorityId, body.typeId);

    if (!result)
      return response({
        statusCode: 400,
        body: { message: "No record found for the given authority" },
      });

    return response({
      statusCode: 200,
      body: {
        seaSubTypes: result,
      },
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
export const handler = getSeaSubTypes;
