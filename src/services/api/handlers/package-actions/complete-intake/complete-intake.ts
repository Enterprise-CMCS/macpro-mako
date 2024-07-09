import { completeIntakeSchema, Action } from "shared-types";
import { response } from "../../../libs/handler";
import { produceMessage } from "../../../libs/kafka";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";
import { config, TOPIC_NAME } from "../../packageActions";
import * as sql from "mssql";

export async function completeIntake(body: any) {
  console.log("CMS performing intake for a record.");

  const result = completeIntakeSchema.safeParse(body);
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

  const now = new Date().getTime();
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // Generate INSERT statements for typeIds
    const typeIdsValues = result.data.typeIds
      .map((typeId: number) => `('${result.data.id}', '${typeId}')`)
      .join(",\n");

    const typeIdsInsert = typeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_Types (ID_Number, Service_Type_ID) VALUES ${typeIdsValues};`
      : "";

    // Generate INSERT statements for subTypeIds
    const subTypeIdsValues = result.data.subTypeIds
      .map((subTypeId: number) => `('${result.data.id}', '${subTypeId}')`)
      .join(",\n");

    const subTypeIdsInsert = subTypeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID) VALUES ${subTypeIdsValues};`
      : "";

    await transaction.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          Title_Name = ${
            result.data.subject
              ? `'${result.data.subject.replace("'", "''")}'`
              : "NULL"
          },
          Summary_Memo = ${
            result.data.description
              ? `'${result.data.description.replace("'", "''")}'`
              : "NULL"
          },
          Lead_Analyst_ID = ${result.data.cpoc ? result.data.cpoc : "NULL"},
          Status_Memo = ${buildStatusMemoQuery(result.data.id, `Intake Completed:  Intake was completed by ${result.data.submitterName}`)}
        WHERE ID_Number = '${result.data.id}'

        -- Insert all types into State_Plan_Service_Types
        ${typeIdsInsert}

        -- Insert all types into State_Plan_Service_SubTypes
        ${subTypeIdsInsert}
    `);

    await produceMessage(
      TOPIC_NAME,
      result.data.id,
      JSON.stringify({
        actionType: Action.COMPLETE_INTAKE,
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
