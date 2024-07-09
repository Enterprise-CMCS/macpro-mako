import {
  WithdrawPackage,
  withdrawPackageSchema,
  SEATOOL_STATUS,
  Action,
} from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, getIdsToUpdate, TOPIC_NAME } from "../../packageActions";
import * as sql from "mssql";

export async function withdrawPackage(body: WithdrawPackage) {
  console.log("State withdrawing a package.");
  // Check incoming data
  const result = withdrawPackageSchema.safeParse(body);
  if (result.success === false) {
    console.error(
      "Withdraw Package event validation error. The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: { message: "Withdraw Package event validation error" },
    });
  }
  // Begin query (data is confirmed)
  const today = seaToolFriendlyTimestamp();
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const idsToUpdate = await getIdsToUpdate(result.data.id);
    for (const id of idsToUpdate) {
      const query = `
        UPDATE SEA.dbo.State_Plan
          SET 
            SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
              SEATOOL_STATUS.WITHDRAWN
            }'),
            Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
            Status_Memo = ${buildStatusMemoQuery(id, "Package Withdrawn")}
          WHERE ID_Number = '${id}'
      `;
      const txnResult = await transaction.request().query(query);
      console.log(txnResult);

      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          ...result.data,
          id,
          actionType: Action.WITHDRAW_PACKAGE,
        }),
      );
    }
    // Commit transaction
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
