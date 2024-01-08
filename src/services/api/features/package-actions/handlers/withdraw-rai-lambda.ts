import { z } from "zod";
import { type APIGatewayEvent } from "aws-lambda";
import { response } from "@/shared/lambda-response";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { PackageActionWriteService } from "@/features/package-actions/services/package-action-write-service";
import { seatoolConnection } from "@/features/package-actions/consts/sql-connection";
import { kafkaConfig } from "@/features/package-actions/consts/kafka-connection";
import { TOPIC_NAME } from "../consts/kafka-topic-name";

// three types of schema (form schema, action kafka event schema, api schema)
// can we share the same schema (form and api) some how
// how can we build on top of the established form schema

export const withdrawRaiLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({
      id: z.string(),
      raiDate: z.number(),
      raiWithdrawnDate: z.number(),
    }),
    async lambda(data) {
      // withdraw rai
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

      // we need to update the status eventually here
      await packageActionService.changePackageStatus({
        id: data.id,
        status: "Pending",
      });

      return response({
        body: {
          message: "successfuly written to seatool",
        },
      });
    },
  });
};
