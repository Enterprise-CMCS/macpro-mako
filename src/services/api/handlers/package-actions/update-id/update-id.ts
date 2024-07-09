import { updateIdSchema, SEATOOL_STATUS, Action } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, TOPIC_NAME } from "../../packageActions";
import * as sql from "mssql";

export async function updateId(body: any) {
  console.log("CMS updating the ID of a package.");

  const result = updateIdSchema.safeParse(body);
  if (!result.success) {
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
  console.log(JSON.stringify(result.data, null, 2));

  const now = new Date().getTime();
  const today = seaToolFriendlyTimestamp();
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // Copy State_Plan row, dropping UUID and replica_id
    await transaction.request().query(`
      DECLARE @columns NVARCHAR(MAX), @sql NVARCHAR(MAX), @newId NVARCHAR(50), @originalId NVARCHAR(50);

      SET @newId = '${result.data.newId}';
      SET @originalId = '${body.id}';
      
      SELECT @columns = COALESCE(@columns + ', ', '') + QUOTENAME(column_name)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'State_Plan' AND column_name != 'ID_Number' AND column_name != 'UUID' AND column_name != 'replica_id' AND table_schema = 'dbo'
        ORDER BY ordinal_position;
      
      SET @sql = 'INSERT INTO SEA.dbo.State_Plan (ID_Number, ' + @columns + ') SELECT ''' + @newId + ''' as ID_Number, ' + @columns + ' FROM SEA.dbo.State_Plan WHERE ID_Number = ''' + @originalId + '''';
      EXEC sp_executesql @sql;
    `);

    // Copy RAI rows
    await transaction.request().query(`
      INSERT INTO RAI (ID_Number, RAI_REQUESTED_DATE, RAI_RECEIVED_DATE, RAI_WITHDRAWN_DATE)
        SELECT '${result.data.newId}', RAI_REQUESTED_DATE, RAI_RECEIVED_DATE, RAI_WITHDRAWN_DATE
        FROM RAI
        WHERE ID_Number = '${body.id}';
    `);

    // Copy Types rows
    await transaction.request().query(`
      INSERT INTO State_Plan_Service_Types (ID_Number, Service_Type_ID)
        SELECT '${result.data.newId}', Service_Type_ID
        FROM State_Plan_Service_Types
        WHERE ID_Number = '${body.id}';
    `);

    //Copy SubTypes rows
    await transaction.request().query(`
      INSERT INTO State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID)
        SELECT '${result.data.newId}', Service_SubType_ID
        FROM State_Plan_Service_SubTypes
        WHERE ID_Number = '${body.id}';
    `);

    //Copy Action_Officers rows
    await transaction.request().query(`
      INSERT INTO Action_Officers (ID_Number, Officer_ID)
        SELECT '${result.data.newId}', Officer_ID
        FROM Action_Officers
        WHERE ID_Number = '${body.id}';
    `);

    // Put Status Memo notes in the old package
    await transaction.request().query(`
      UPDATE SEA.dbo.State_Plan
      SET 
        SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
          SEATOOL_STATUS.TERMINATED
        }'),
        Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
        Status_Memo = ${buildStatusMemoQuery(body.id, `Package Terminated via ID Update: this package was copied to ${result.data.newId} and then terminated.`)}
      WHERE ID_Number = '${body.id}'
    `);

    // Put Status Memo notes in the new package; this could be combined into the insert above, for speed.
    await transaction.request().query(`
    UPDATE SEA.dbo.State_Plan
      SET 
        Status_Memo = ${buildStatusMemoQuery(body.id, `Package Created via ID Update: this package was copied from ${body.id}.`)}
      WHERE ID_Number = '${result.data.newId}'
    `);

    await produceMessage(
      TOPIC_NAME,
      body.id,
      JSON.stringify({
        actionType: Action.UPDATE_ID,
        timestamp: now,
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

  return response({
    statusCode: 200,
    body: {
      message: "record successfully submitted",
    },
  });
}
