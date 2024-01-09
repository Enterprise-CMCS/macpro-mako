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
} from "shared-types";
import { produceMessage } from "../libs/kafka";
import { response } from "../libs/handler";
import { SEATOOL_STATUS } from "shared-types/statusHelper";
import { getLatestRai } from "shared-utils";

const TOPIC_NAME = process.env.topicName as string;

export async function issueRai(body: RaiIssue) {
  console.log("CMS issuing a new RAI");
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    // Issue RAI
    const query1 = `
      Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
        values ('${body.id}'
        ,dateadd(s, convert(int, left(${body.requestedDate}, 10)), cast('19700101' as datetime)))
    `;
    const result1 = await transaction.request().query(query1);
    console.log(result1);

    // Update Status
    const query2 = `
      UPDATE SEA.dbo.State_Plan
        SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${SEATOOL_STATUS.PENDING_RAI}')
        WHERE ID_Number = '${body.id}'
    `;
    const result2 = await transaction.request().query(query2);
    console.log(result2);

    // write to kafka here
    const result = raiIssueSchema.safeParse(body);
    if (result.success === false) {
      console.log(
        "RAI Validation Error. The following record failed to parse: ",
        JSON.stringify(body),
        "Because of the following Reason(s):",
        result.error.message
      );
    } else {
      await produceMessage(
        TOPIC_NAME,
        body.id,
        JSON.stringify({ ...result.data, actionType: Action.ISSUE_RAI })
      );
    }

    // Commit transaction
    await transaction.commit();
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error("Error executing one or both queries:", err);
    throw err;
  } finally {
    // Close pool
    await pool.close();
  }
}

export async function withdrawRai(body: RaiWithdraw, rais: any) {
  const activeKey = getLatestRai(rais)?.key;
  const result = raiWithdrawSchema.safeParse({
    ...body,
    requestedDate: activeKey,
  });
  console.log("Withdraw body is", body);

  if (result.success === true) {
    console.log("CMS withdrawing an RAI");
    console.log(rais);
    console.log("LATEST RAI KEY: " + activeKey);
    const pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      // Issue RAI
      const query1 = `
        UPDATE SEA.dbo.RAI
        SET RAI_WITHDRAWN_DATE = DATEADD(s, CONVERT(int, LEFT('${result.data.withdrawnDate}', 10)), CAST('19700101' AS DATETIME))
          WHERE ID_Number = '${result.data.id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${activeKey}', 10)), CAST('19700101' AS DATETIME))
      `;
      const result1 = await transaction.request().query(query1);
      console.log(result1);

      // Update Status
      const query2 = `
      UPDATE SEA.dbo.State_Plan
        SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${SEATOOL_STATUS.PENDING}')
        WHERE ID_Number = '${result.data.id}'
    `;
      const result2 = await transaction.request().query(query2);
      console.log(result2);

      // write to kafka here
      await produceMessage(
        TOPIC_NAME,
        result.data.id,
        JSON.stringify({ ...result.data, actionType: Action.WITHDRAW_RAI })
      );

      // Commit transaction
      await transaction.commit();
    } catch (err) {
      // Rollback and log
      await transaction.rollback();
      console.error("Error executing one or both queries:", err);
      throw err;
    } finally {
      // Close pool
      await pool.close();
    }

    console.log(body);
  } else {
    console.log("An error occured with withdraw payload: ", result.error);
    throw "An error occured with withdraw payload.";
  }
}

export async function respondToRai(body: RaiResponse, rais: any) {
  console.log("State responding to RAI");
  const latestRai = getLatestRai(rais);
  if (latestRai?.status != "requested") {
    throw "Latest RAI is not a candidate for response";
  }
  const activeKey = latestRai.key;
  console.log("LATEST RAI KEY: " + activeKey);
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  console.log(body);
  try {
    await transaction.begin();
    // Issue RAI
    const query1 = `
      UPDATE SEA.dbo.RAI
        SET RAI_RECEIVED_DATE = DATEADD(s, CONVERT(int, LEFT('${body.responseDate}', 10)), CAST('19700101' AS DATETIME))
        WHERE ID_Number = '${body.id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${activeKey}', 10)), CAST('19700101' AS DATETIME))
    `;
    const result1 = await transaction.request().query(query1);
    console.log(result1);

    // Update Status
    const query2 = `
      UPDATE SEA.dbo.State_Plan
        SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${SEATOOL_STATUS.PENDING}')
        WHERE ID_Number = '${body.id}'
    `;
    const result2 = await transaction.request().query(query2);
    console.log(result2);

    //   // write to kafka here
    const result = raiResponseSchema.safeParse({
      ...body,
      requestedDate: activeKey,
    });
    if (result.success === false) {
      console.log(
        "RAI Validation Error. The following record failed to parse: ",
        JSON.stringify(body),
        "Because of the following Reason(s):",
        result.error.message
      );
    } else {
      console.log(JSON.stringify(result, null, 2));
      await produceMessage(
        TOPIC_NAME,
        body.id,
        JSON.stringify({
          ...result.data,
          actionType: Action.RESPOND_TO_RAI,
        })
      );
    }

    // Commit transaction
    await transaction.commit();
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error("Error executing one or both queries:", err);
    throw err;
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
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  const query = `
    UPDATE SEA.dbo.State_Plan
      SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${SEATOOL_STATUS.WITHDRAWN}')
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
