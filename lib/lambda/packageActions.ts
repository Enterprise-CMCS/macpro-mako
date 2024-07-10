import * as sql from "mssql";
import {
  Action,
  raiIssueSchema,
  RaiIssue,
  raiResponseSchema,
  RaiResponse,
  raiWithdrawSchema,
  RaiWithdraw,
  withdrawPackageSchema,
  WithdrawPackage,
  toggleWithdrawRaiEnabledSchema,
  ToggleWithdrawRaiEnabled,
  removeAppkChildSchema,
  opensearch,
  updateIdSchema,
  completeIntakeSchema,
} from "shared-types";
import { produceMessage } from "../libs/api/kafka";
import { response } from "libs/handler-lib";
import { SEATOOL_STATUS } from "shared-types/statusHelper";
import {
  formatSeatoolDate,
  seaToolFriendlyTimestamp,
  getNextBusinessDayTimestamp,
} from "shared-utils";
import { buildStatusMemoQuery } from "../libs/api/statusMemo";
import { getAppkChildren } from "../libs/api/package";
import { getItem } from "libs";
import { getSecret } from "shared-utils";

const TOPIC_NAME = process.env.topicName as string;

let config: sql.config;
const secretName = process.env.dbInfoSecretName;
if (!secretName) {
  throw new Error("Environment variable dbInfoSecretName is not set");
}

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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
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
              SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
                SEATOOL_STATUS.PENDING_RAI
              }'),
              Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
              Status_Memo = ${buildStatusMemoQuery(
                id,
                `RAI Response Withdrawn.  This withdrawal is for the RAI requested on ${formatSeatoolDate(
                  document.raiRequestedDate,
                )} and received on ${formatSeatoolDate(
                  document.raiReceivedDate,
                )}`,
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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  let statusMemoUpdate: string;

  // Potentially overwriting data... will be as verbose as possible.
  if (document.raiReceivedDate && document.raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      result.data.id,
      `RAI Response Received.  This overwrites the previous response received on ${formatSeatoolDate(
        document.raiReceivedDate,
      )} and withdrawn on ${formatSeatoolDate(document.raiWithdrawnDate)}`,
    );
  } else if (document.raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      result.data.id,
      `RAI Response Received.  This overwrites a previous response withdrawn on ${formatSeatoolDate(
        document.raiWithdrawnDate,
      )}`,
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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
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

export async function toggleRaiResponseWithdraw(
  body: ToggleWithdrawRaiEnabled,
  toggle: boolean,
) {
  const result = toggleWithdrawRaiEnabledSchema.safeParse({
    ...body,
    raiWithdrawEnabled: toggle,
  });
  if (result.success === false) {
    console.error(
      "Toggle Rai Response Withdraw Enable event validation error. The following record failed to parse: ",
      JSON.stringify(body),
      "Because of the following Reason(s):",
      result.error.message,
    );
    return response({
      statusCode: 400,
      body: {
        message: "Toggle Rai Response Withdraw Enable event validation error",
      },
    });
  }
  try {
    const idsToUpdate = await getIdsToUpdate(result.data.id);
    for (const id of idsToUpdate) {
      await produceMessage(
        TOPIC_NAME,
        id,
        JSON.stringify({
          actionType: toggle
            ? Action.ENABLE_RAI_WITHDRAW
            : Action.DISABLE_RAI_WITHDRAW,
          ...result.data,
          id,
        }),
      );
    }

    return response({
      statusCode: 200,
      body: {
        message: "record successfully submitted",
      },
    });
  } catch (err) {
    console.log(err);

    return response({
      statusCode: 500,
    });
  }
}

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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  const today = seaToolFriendlyTimestamp();

  try {
    await transaction.begin();

    await transaction.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
            SEATOOL_STATUS.WITHDRAWN
          }'),
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

async function getIdsToUpdate(id: string) {
  console.log(process.env.osDomain);
  console.log(id);
  const og = (await getItem(
    process.env.osDomain!,
    `${process.env.indexNamespace!}main`,
    id,
  )) as opensearch.main.ItemResult;
  if (!og) {
    throw "Package doesn't exist, and it should.";
  }
  console.log(JSON.stringify(og, null, 2));
  const idsToUpdate = [og._id];
  if (og._source.appkParent) {
    const children = await getAppkChildren(og._id);
    children.hits?.hits?.forEach((child) => {
      idsToUpdate.push(child._id);
    });
  }
  return idsToUpdate;
}

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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
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
        Status_Memo = ${buildStatusMemoQuery(
          body.id,
          `Package Terminated via ID Update: this package was copied to ${result.data.newId} and then terminated.`,
        )}
      WHERE ID_Number = '${body.id}'
    `);

    // Put Status Memo notes in the new package; this could be combined into the insert above, for speed.
    await transaction.request().query(`
    UPDATE SEA.dbo.State_Plan
      SET 
        Status_Memo = ${buildStatusMemoQuery(
          body.id,
          `Package Created via ID Update: this package was copied from ${body.id}.`,
        )}
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
  const config = await getDbInfo(process.env.dbInfoSecretName!);
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
          Status_Memo = ${buildStatusMemoQuery(
            result.data.id,
            `Intake Completed:  Intake was completed by ${result.data.submitterName}`,
          )}
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

export async function getDbInfo(secretName: string) {
  const secret = JSON.parse(await getSecret(secretName));
  const { ip, port, user, password } = secret;
  config = {
    user,
    password,
    server: ip,
    port: parseInt(port as string),
    database: "SEA",
  } as sql.config;
  return config;
}
