import * as sql from "mssql";

const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort as string);
const config = {
  user: user,
  password: password,
  server: server,
  port: port,
  database: "SEA",
} as sql.config;

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
} from "shared-types";
import { produceMessage } from "../libs/kafka";
import { response } from "../libs/handler";
import { SEATOOL_STATUS } from "shared-types/statusHelper";
import { formatSeatoolDate, seaToolFriendlyTimestamp } from "shared-utils";
import { buildStatusMemoQuery } from "../libs/statusMemo";

const TOPIC_NAME = process.env.topicName as string;

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
    // Issue RAI
    const query1 = `
      Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
        values ('${body.id}'
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
        Status_Memo = ${buildStatusMemoQuery(body.id, "RAI Issued")}
      WHERE ID_Number = '${body.id}'
    `;
    const result2 = await transaction.request().query(query2);
    console.log(result2);

    // write to kafka here
    await produceMessage(
      TOPIC_NAME,
      body.id,
      JSON.stringify({
        ...result.data,
        actionType: Action.ISSUE_RAI,
      }),
    );

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
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // Set Received Date
    await transaction.request().query(`
        UPDATE SEA.dbo.RAI
          SET 
            RAI_WITHDRAWN_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME))
        WHERE ID_Number = '${result.data.id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToWithdraw}', 10)), CAST('19700101' AS DATETIME))
      `);
    // Set Status to Pending - RAI
    await transaction.request().query(`
        UPDATE SEA.dbo.State_Plan
          SET 
            SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${SEATOOL_STATUS.PENDING_RAI}'),
            Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
            Status_Memo = ${buildStatusMemoQuery(
              result.data.id,
              `RAI Response Withdrawn.  This withdrawal is for the RAI requested on ${formatSeatoolDate(document.raiRequestedDate)} and received on ${formatSeatoolDate(document.raiReceivedDate)}`,
            )}
          WHERE ID_Number = '${result.data.id}'
      `);

    // write to kafka here
    await produceMessage(
      TOPIC_NAME,
      result.data.id,
      JSON.stringify({
        ...result.data,
        actionType: Action.WITHDRAW_RAI,
      }),
    );

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
    // Issue RAI
    const query1 = `
        UPDATE SEA.dbo.RAI
          SET 
            RAI_RECEIVED_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME)),
            RAI_WITHDRAWN_DATE = NULL
          WHERE ID_Number = '${body.id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToRespondTo}', 10)), CAST('19700101' AS DATETIME))
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
          WHERE ID_Number = '${body.id}'
      `;
    const result2 = await transaction.request().query(query2);
    console.log(result2);

    // Write to kafka here
    console.log(JSON.stringify(result, null, 2));
    await produceMessage(
      TOPIC_NAME,
      body.id,
      JSON.stringify({
        ...result.data,
        responseDate: today,
        actionType: Action.RESPOND_TO_RAI,
      }),
    );

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
      result.error.message
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
  const query = `
    UPDATE SEA.dbo.State_Plan
      SET 
        SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${
          SEATOOL_STATUS.WITHDRAWN
        }'),
        Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
        Status_Memo = ${buildStatusMemoQuery(
          result.data.id,
          "Package Withdrawn"
        )}
      WHERE ID_Number = '${body.id}'
  `;

  try {
    await transaction.begin();
    const txnResult = await transaction.request().query(query);
    console.log(txnResult);

    await produceMessage(
      TOPIC_NAME,
      body.id,
      JSON.stringify({ ...result.data, actionType: Action.WITHDRAW_PACKAGE })
    );
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
  toggle: boolean
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
      result.error.message
    );
    return response({
      statusCode: 400,
      body: {
        message: "Toggle Rai Response Withdraw Enable event validation error",
      },
    });
  }
  try {
    await produceMessage(
      TOPIC_NAME,
      body.id,
      JSON.stringify({
        actionType: toggle
          ? Action.ENABLE_RAI_WITHDRAW
          : Action.DISABLE_RAI_WITHDRAW,
        ...result.data,
      })
    );

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
            "Package Withdrawn"
          )}
        WHERE ID_Number = '${doc.id}'
    `);
    await produceMessage(
      TOPIC_NAME,
      doc.id,
      JSON.stringify({
        actionType: Action.REMOVE_APPK_CHILD,
        ...result.data,
      })
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
