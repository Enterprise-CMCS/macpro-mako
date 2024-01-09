import { APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { z } from "zod";
import { response } from "@/libs/handler";
import { kafkaConfig } from "@/features/package-actions/consts/kafka-connection";
import { TOPIC_NAME } from "@/features/package-actions/consts/kafka-topic-name";
import { seatoolConnection } from "../consts/sql-connection";
import { PackageActionWriteService } from "../services/package-action-write-service";

export const enableRaiWithdrawLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: z.object({
      enableRaiWithDraw: z.boolean(),
      id: z.string(),
    }),
    async lambda(data) {
      const packageActionWriteService =
        await PackageActionWriteService.createPackageActionWriteService(
          kafkaConfig,
          seatoolConnection,
          TOPIC_NAME
        );

      await packageActionWriteService.enableRaiWithdraw({
        withdrawEnabled: data.enableRaiWithDraw,
        authority: "medicaid",
        id: data.id,
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
