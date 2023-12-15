import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { z } from "zod";
// this is the withdraw rai package action
const test = () => {
  // return response();
};

export const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({ test: z.string() }),
    async lambda(data, connection) {
      console.log(data);
      await new Promise(() => {
        //
      });
    },
  });
};
