import {
  RaiResponse,
  raiResponseSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import {
  seaToolFriendlyTimestamp,
  formatSeatoolDate,
  getNextBusinessDayTimestamp,
} from "shared-utils";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, getIdsToUpdate, TOPIC_NAME } from "../../packageActions";
import * as sql from "mssql";

export async function respondToRai(body: RaiResponse, document: any) {
  console.log("State responding to RAI");
  if (!document.raiRequestedDate) {
    return response({
      statusCode: 400,
      body: {
        message: "No candidate RAI available",
      },
    });
  }
  const raiToRespondTo = new Date(document.raiRequestedDate).getTime();
  const today = seaToolFriendlyTimestamp();
  const result = raiResponseSchema.safeParse({
    ...body,
    responseDate: today,
    requestedDate: raiToRespondTo,
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
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  let statusMemoUpdate: string;

  // Potentially overwriting data... will be as verbose as possible.
  if (document.raiReceivedDate && document.raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      result.data.id,
      `RAI Response Received.  This overwrites the previous response received on ${formatSeatoolDate(document.raiReceivedDate)} and withdrawn on ${formatSeatoolDate(document.raiWithdrawnDate)}`,
    );
  } else if (document.raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      result.data.id,
      `RAI Response Received.  This overwrites a previous response withdrawn on ${formatSeatoolDate(document.raiWithdrawnDate)}`,
    );
  } else {
    statusMemoUpdate = buildStatusMemoQuery(body.id, "RAI Response Received");
  }
  try {
    await transaction.begin();

    const idsToUpdate = await getIdsToUpdate(result.data.id);
    for (const id of idsToUpdate) {
      // Issue RAI
      const query1 = `
        UPDATE SEA.dbo.RAI
          SET 
            RAI_RECEIVED_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME)),
            RAI_WITHDRAWN_DATE = NULL
          WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToRespondTo}', 10)), CAST('19700101' AS DATETIME))
      `;
      const result1 = await transaction.request().query(query1);
      console.log(result1);

      // Update Status
      const query2 = `
        UPDATE SEA.dbo.State_Plan
          SET 
            SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${SEATOOL_STATUS.PENDING}'),
            Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
            Status_Memo = ${statusMemoUpdate}
          WHERE ID_Number = '${id}'
      `;
      const result2 = await transaction.request().query(query2);
      console.log(result2);

      // Write to kafka here
      console.log(JSON.stringify(result, null, 2));
      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          ...result.data,
          id,
          responseDate: today,
          actionType: Action.RESPOND_TO_RAI,
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
