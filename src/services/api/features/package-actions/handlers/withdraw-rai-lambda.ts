import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { z } from "zod";
import { PackageActionWriteService } from "@/features/package-actions/services/seatool-write-service";
import { seatoolConnection } from "@/features/package-actions/consts/sql-connection";

export const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({
      id: z.string(),
      raiDate: z.number(),
      raiWithdrawnDate: z.number(),
    }),
    async lambda(data) {
      try {
        // withdraw rai
        const packageActionService = await PackageActionWriteService.create(
          seatoolConnection
        );

        await packageActionService.withdrawRai({
          id: data.id,
          activeRaiDate: data.raiDate,
          withdrawnDate: data.raiWithdrawnDate,
        });

        // we need to update the status eventually here
        await packageActionService.changePackageStatus({
          id: data.id,
          status: "PENDING",
        });

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
