import { z } from "zod";
import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { PackageActionWriteService } from "@/features/package-actions/services/package-action-write-service";
import { seatoolConnection } from "@/features/package-actions/consts/sql-connection";
import { kafkaConfig } from "@/features/package-actions/consts/kafka-connection";
import { TOPIC_NAME } from "../consts/kafka-topic-name";

export const withdrawRaiLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: z.object({
      id: z.string(),
      raiDate: z.number(),
      raiWithdrawnDate: z.number(),
    }),
    async lambda(data) {
      const packageActionService =
        await PackageActionWriteService.createPackageActionWriteService(
          kafkaConfig,
          seatoolConnection,
          TOPIC_NAME
        );

      await packageActionService.withdrawRai({
        id: data.id,
        activeRaiDate: data.raiDate,
        withdrawnDate: data.raiWithdrawnDate,
      });

      await packageActionService.changePackageStatus({
        id: data.id,
        status: "Pending",
      });

      return "Withdrew RAI";
    },
  });
};
