import { APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { z } from "zod";
import { response } from "@/libs/handler";
import { PackageActionWriteService } from "../services/seatool-write-service";
import { seatoolConnection } from "../consts/sql-connection";

export const enableRaiWithdrawLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: z.object({
      enableRaiWithDraw: z.boolean(),
    }),
    allowedRoles: [],
    async lambda(data) {
      const packageActionService = await PackageActionWriteService.create(
        seatoolConnection
      );

      packageActionService.setWithdrawEnabled({
        withdrawEnabled: data.enableRaiWithDraw,
      });
      return response({
        statusCode: 200,
        body: {
          testing: "testing",
        },
      });
    },
  });
};
