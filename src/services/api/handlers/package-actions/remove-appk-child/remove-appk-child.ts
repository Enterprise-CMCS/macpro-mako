import {
  SEATOOL_STATUS,
  Action,
  removeAppkChildSchema,
  opensearch,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, TOPIC_NAME } from "../consts";
import * as sql from "mssql";
export async function removeAppkChild(doc: opensearch.main.Document) {
  const result = removeAppkChildSchema.safeParse(doc);

  if (!result.success) {
    return response({
      statusCode: 400,
      body: {
        message: "Remove Appk Child event validation error",
      },
    });
  }

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  const today = seaToolFriendlyTimestamp();

  try {
    await transaction.begin();

    await transaction.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${SEATOOL_STATUS.WITHDRAWN}'),
          Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
          Status_Memo = ${buildStatusMemoQuery(
            result.data.id,
            "Package Withdrawn",
          )}
        WHERE ID_Number = '${doc.id}'
    `);
    await produceMessage(
      TOPIC_NAME,
      doc.id,
      JSON.stringify({
        actionType: Action.REMOVE_APPK_CHILD,
        ...result.data,
      }),
    );
    await transaction.commit();
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error("Error executing query:", err);
    return response({
      statusCode: 500,
      body: err instanceof Error ? { message: err.message } : err,
    });
  } finally {
    // Close pool
    await pool.close();
  }
}
