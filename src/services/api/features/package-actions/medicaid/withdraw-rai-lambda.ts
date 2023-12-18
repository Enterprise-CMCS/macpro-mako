import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { z } from "zod";

export const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({ id: z.string(), raiDate: z.number() }),
    async lambda(data) {
      const raiDate = +Math.floor(data.raiDate / 1000)
        .toString()
        .substring(0, 10);

      try {
        // withdraw rai

        // we need to update the status eventually here

        return response({
          body: {
            error: "successfuly written to seatool",
          },
        });
      } catch (err: unknown) {
        console.error(err);

        return response({
          body: {
            error: "failed to write to seatool",
          },
          statusCode: 500,
        });
      }
    },
  });
};
