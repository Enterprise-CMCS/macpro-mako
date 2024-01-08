import { APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { z } from "zod";
import { response } from "@/shared/lambda-response";

export const withdrawPackageLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({}),
    async lambda(data) {
      return response({
        statusCode: 200,
        body: { data },
      });
    },
  });
};
