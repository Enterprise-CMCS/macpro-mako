import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { z } from "zod";
import { PackageActionWriteService } from "../services/package-action-write-service";
import { seatoolConnection } from "../consts/sql-connection";
import { kafkaConfig } from "../consts/kafka-connection";
import { response } from "@/libs/handler";
import { TOPIC_NAME } from "../consts/kafka-topic-name";

export const respondToRaiLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: z.object({
      id: z.string(),
      latestRai: z.number(),
      responseDate: z.number(),
    }),
    async lambda(data) {
      const packageActionService =
        await PackageActionWriteService.createPackageActionWriteService(
          kafkaConfig,
          seatoolConnection,
          TOPIC_NAME
        );

      await packageActionService.respondToRai({
        id: data.id,
        latestRai: data.latestRai,
        responseDate: data.responseDate,
      });

      await packageActionService.changePackageStatus({
        id: data.id,
        status: "Pending",
      });

      return response({
        statusCode: 200,
        body: {
          message: "successfully responded to rai",
        },
      });
    },
  });
};
