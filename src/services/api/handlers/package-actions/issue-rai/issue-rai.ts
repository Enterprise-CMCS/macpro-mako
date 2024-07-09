import { RaiIssue, raiIssueSchema, SEATOOL_STATUS, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, getIdsToUpdate, TOPIC_NAME } from "../../packageActions";
import * as sql from "mssql";

export async function issueRai(body: RaiIssue) {
  console.log("CMS issuing a new RAI");
  const today = seaToolFriendlyTimestamp();
  const result = raiIssueSchema.safeParse({ ...body, requestedDate: today });
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
  try {
    await transaction.begin();

    const idsToUpdate = await getIdsToUpdate(result.data.id);
    console.log(idsToUpdate);
    console.log("ASDFASDFASDF");
    for (const id of idsToUpdate) {
      // Issue RAI
      const query1 = `
        Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
          values ('${id}'
          ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)))
      `;
      const result1 = await transaction.request().query(query1);
      console.log(result1);

      // Update Status
      const query2 = `
        UPDATE SEA.dbo.State_Plan
        SET 
          SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
            SEATOOL_STATUS.PENDING_RAI
          }'),
          Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
          Status_Memo = ${buildStatusMemoQuery(id, "RAI Issued")}
        WHERE ID_Number = '${id}'
      `;
      const result2 = await transaction.request().query(query2);
      console.log(result2);

      // write to kafka here
      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          ...result.data,
          id,
          actionType: Action.ISSUE_RAI,
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
