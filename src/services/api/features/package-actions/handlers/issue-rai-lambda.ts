import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "../lambda-handler";
import { response } from "@/libs/handler";
import { PackageActionWriteService } from "../services/package-action-write-service";
import { seatoolConnection } from "../consts/sql-connection";
import { kafkaConfig } from "../consts/kafka-connection";
import { raiIssueSchema } from "shared-types";
import { TOPIC_NAME } from "../consts/kafka-topic-name";

export const issueRaiLambda = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    schema: raiIssueSchema, // don't use this
    allowedRoles: [],
    async lambda(data) {
      const packageActionService =
        await PackageActionWriteService.createPackageActionWriteService(
          kafkaConfig,
          seatoolConnection,
          TOPIC_NAME
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
