import { APIGatewayEvent } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { response } from "../libs/handler";

// type GetCpocsBody = object;

export const queryCpocs = async () => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  const query = {
    size: 200,
    // query: {
    //   bool: {
    //     must: [
    //       {
    //         match: {
    //           authorityId: authorityId,
    //         },
    //       },
    //     ],
    //     must_not: [
    //       {
    //         match_phrase: {
    //           name: {
    //             query: "Do Not Use",
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },
    sort: [
      {
        "lastName.keyword": {
          order: "asc",
        },
      },
    ],
  };
  return await os.search(process.env.osDomain, "cpocs", query);
};

export const getCpocs = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  // const body = JSON.parse(event.body) as GetCpocsBody;
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
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getCpocs;
