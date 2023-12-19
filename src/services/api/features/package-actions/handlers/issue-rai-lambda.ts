import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { response } from "@/libs/handler";
import { PackageActionWriteService } from "../services/package-action-write-service";
import { seatoolConnection } from "../consts/sql-connection";
import { kafkaConfig } from "../consts/kafka-connection";
import { raiIssueSchema } from "shared-types";

export const issueRaiLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: raiIssueSchema,
    allowedRoles: [],
    async lambda(data) {
      const packageActionService = await PackageActionWriteService.create(
        seatoolConnection,
        kafkaConfig
      );

      try {
        await packageActionService.issueRai(data);

        await packageActionService.changePackageStatus({
          id: data.id,
          status: "Pending-RAI",
        });

        return response({
          statusCode: 200,
          body: {
            message: "rai issued successfully",
          },
        });
      } catch (err: unknown) {
        console.error("failed to issue rai successfully", err);

        return response({ statusCode: 500 });
      }
    },
  });
};
