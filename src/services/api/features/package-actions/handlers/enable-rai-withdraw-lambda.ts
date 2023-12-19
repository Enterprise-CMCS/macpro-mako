import { APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { z } from "zod";
import { response } from "@/libs/handler";
import { PackageActionWriteService } from "../services/package-action-write-service";
import { seatoolConnection } from "../consts/sql-connection";
import { kafkaConfig } from "../consts/kafka-connection";

export const enableRaiWithdrawLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: z.object({
      enableRaiWithDraw: z.boolean(),
      id: z.string(),
    }),
    allowedRoles: [],
    async lambda(data) {
      const packageActionService = await PackageActionWriteService.create(
        seatoolConnection,
        kafkaConfig
      );

      await packageActionService.setWithdrawEnabled({
        withdrawEnabled: data.enableRaiWithDraw,
        authority: "medicaid",
        id: data.id,
        topicName: process.env.topicName!,
      });

      return response({
        statusCode: 200,
        body: {
          message: "success",
        },
      });
    },
  });
};
