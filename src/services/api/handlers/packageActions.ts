import * as sql from "mssql";

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

import { OneMacSink, transformOnemac } from "shared-types";
import { produceMessage } from "../libs/kafka";
import { response } from "../libs/handler";
import { SEATOOL_STATUS } from "shared-types/statusHelper";

const TOPIC_NAME = process.env.topicName;

export async function issueRai({
  id,
  timestamp,
}: {
  id: string;
  timestamp: number;
}) {
  console.log("CMS issuing a new RAI");
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    // Issue RAI
    const query1 = `
      Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
        values ('${id}'
        ,dateadd(s, convert(int, left(${timestamp}, 10)), cast('19700101' as datetime)))
    `;
    const result1 = await transaction.request().query(query1);
    console.log(result1);

    // Update Status
    const query2 = `
      UPDATE SEA.dbo.State_Plan
        SET SPW_Status_ID = (Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = '${SEATOOL_STATUS.PENDING_RAI}')
        WHERE ID_Number = '${id}'
    `;
    const result2 = await transaction.request().query(query2);
    console.log(result2);

    // Commit transaction
    await transaction.commit();
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error("Error executing one or both queries:", err);
  } finally {
    // Close pool
    await pool.close();
  }
}

export async function withdrawRai(id, timestamp) {
  console.log("CMS withdrawing an RAI");
}

export async function respondToRai(id, timestamp) {
  console.log("State respnding to RAI");
}

export async function withdrawPackage(id, timestamp) {
  console.log("State withdrawing a package.");
}

export async function toggleRaiResponseWithdraw(body, toggle) {
  const { id } = body;
  try {
    await produceMessage(
      TOPIC_NAME,
      id,
      JSON.stringify({ raiWithdrawEnabled: toggle })
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
