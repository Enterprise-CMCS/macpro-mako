import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
// import { getStateFilter } from "../libs/auth/user";
// import { OsHit, OsMainSourceItem } from "shared-types";

export const submit = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);
    console.log(body);

    return response({
      statusCode: 200,
      body: { message: "totally" },
    });

    // const result = (await os.getItem(
    //   process.env.osDomain,
    //   "main",
    //   body.id
    // )) as OsHit<OsMainSourceItem> & { found: boolean };

    // if (
    //   stateFilter &&
    //   !stateFilter.terms.state.includes(
    //     result._source.state.toLocaleLowerCase()
    //   )
    // ) {
    //   return response({
    //     statusCode: 401,
    //     body: { message: "Not authorized to view this resource" },
    //   });
    // }

    // if (!result.found) {
    //   return response({
    //     statusCode: 404,
    //     body: { message: "No record found for the given id" },
    //   });
    // } else {
    //   return response<unknown>({
    //     statusCode: 200,
    //     body: result,
    //   });
    // }
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = submit;
