import * as sql from "mssql";
import { SEATOOL_STATUS } from "shared-types/statusHelper";

const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort);
const config = {
  user: user,
  password: password,
  server: server,
  port: port,
  database: "SEA",
};

import { Action, OneMacSink, WithdrawPackageSchema, transformOnemac, withdrawPackageEventSchema } from "shared-types";
import { produceMessage } from "../libs/kafka";
import { response } from "../libs/handler";

const TOPIC_NAME = process.env.topicName;

export async function issueRai(id: string, timestamp: number) {
  console.log("CMS issuing a new RAI");
  const pool = await sql.connect(config);
  const query = `
    Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
      values ('${id}'
        ,dateadd(s, convert(int, left(${timestamp}, 10)), cast('19700101' as datetime)))
  `;
  // Prepare the request
  const request = pool.request();
  request.input("ID_Number", sql.VarChar, id);
  request.input("RAI_Requested_Date", sql.DateTime, new Date(timestamp));

  const result = await sql.query(query);
  console.log(result);
  await pool.close();
}

export async function withdrawRai(id, timestamp) {
  console.log("CMS withdrawing an RAI");
}

export async function respondToRai(id, timestamp) {
  console.log("State respnding to RAI");
}

export async function withdrawPackage(body: WithdrawPackageSchema) {
  console.log("State withdrawing a package.");
  // Check incoming data
  const result = withdrawPackageEventSchema.safeParse(body);
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
      body: { message: err.message },
    });
  } finally {
    // Close pool
    await pool.close();
  }

}

export async function toggleRaiResponseWithdraw(
  body: { id: string },
  toggle: boolean
) {
  const { id } = body;
  try {
    await produceMessage(
      TOPIC_NAME,
      id,
      JSON.stringify({
        raiWithdrawEnabled: toggle,
        actionType: toggle
          ? Action.ENABLE_RAI_WITHDRAW
          : Action.DISABLE_RAI_WITHDRAW,
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
