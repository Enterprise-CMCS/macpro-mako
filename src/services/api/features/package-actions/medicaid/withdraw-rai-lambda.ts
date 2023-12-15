import { response } from "@/shared/lambda-response";
import { type APIGatewayEvent } from "aws-lambda";
import { handleEvent } from "@/features/package-actions/lambda-handler";
import { z } from "zod";
import { SEATOOL_STATUS } from "shared-types";

export const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: [],
    schema: z.object({ id: z.string(), raiDate: z.number() }),
    async lambda(data, db) {
      const raiDate = +Math.floor(data.raiDate / 1000)
        .toString()
        .substring(0, 10);

      try {
        // withdraw rai
        await db("SEA.dbo.RAI")
          .where("ID_Number", "=", data.id)
          .andWhere(
            "RAI_REQUESTED_DATE",
            "=",
            db.raw("DATEADD(s,?,CAST('19700101' AS DATETIME))", [raiDate])
          )
          .update({
            ["RAI_WITHDRAWN_DATE"]: db.raw(
              "DATEADD(s,?,CAST('19700101' AS DATETIME))",
              [raiDate]
            ),
          });

        const statusId = await db
          .first("SPW_Status_ID")
          .from("SEA.dbo.SPW_Status")
          .where("SPW_Status_DESC", "=", SEATOOL_STATUS.PENDING);

        await db("SEA.dbo.State_Plan").where("ID_NUMBER", "=", data.id).update({
          SPW_Status_ID: statusId,
        });
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
