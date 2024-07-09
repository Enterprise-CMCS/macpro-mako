import {
  RaiWithdraw,
  raiWithdrawSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import {
  seaToolFriendlyTimestamp,
  formatSeatoolDate,
  getNextBusinessDayTimestamp,
} from "shared-utils";
import { response } from "../../libs/handler";
import { produceMessage } from "../../libs/kafka";
import { buildStatusMemoQuery } from "../../libs/statusMemo";
import * as sql from "mssql";
import { TOPIC_NAME, config, getIdsToUpdate } from "../packageActions";

export async function withdrawRai(body: RaiWithdraw, document: any) {
  console.log("State withdrawing an RAI Response");
  if (!document.raiRequestedDate) {
    return response({
      statusCode: 400,
      body: {
        message: "No candidate RAI available",
      },
    });
  }
  const raiToWithdraw = new Date(document.raiRequestedDate).getTime();
  const today = seaToolFriendlyTimestamp();
  const result = raiWithdrawSchema.safeParse({
    ...body,
    requestedDate: raiToWithdraw,
    withdrawnDate: today,
  });
  if (result.success === false) {
    console.error(
      "validation error:  The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: {
        message: "Event validation error",
      },
    });
  }
  console.log("LATEST RAI KEY: " + raiToWithdraw);
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const idsToUpdate = await getIdsToUpdate(result.data.id);
    for (const id of idsToUpdate) {
      // Set Received Date
      await transaction.request().query(`
          UPDATE SEA.dbo.RAI
            SET 
              RAI_WITHDRAWN_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME))
          WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToWithdraw}', 10)), CAST('19700101' AS DATETIME))
        `);
      // Set Status to Pending - RAI
      await transaction.request().query(`
          UPDATE SEA.dbo.State_Plan
            SET 
              SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${SEATOOL_STATUS.PENDING_RAI}'),
              Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
              Status_Memo = ${buildStatusMemoQuery(
                id,
                `RAI Response Withdrawn.  This withdrawal is for the RAI requested on ${formatSeatoolDate(document.raiRequestedDate)} and received on ${formatSeatoolDate(document.raiReceivedDate)}`,
              )}
            WHERE ID_Number = '${id}'
        `);

      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          ...result.data,
          id,
          actionType: Action.WITHDRAW_RAI,
          notificationMetadata: {
            submissionDate: getNextBusinessDayTimestamp(),
          },
        }),
      );
    }

    // Commit transaction
    await transaction.commit();
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error(err);
    return response({
      statusCode: 500,
      body: err instanceof Error ? { message: err.message } : err,
    });
  } finally {
    // Close pool
    await pool.close();
  }
}
