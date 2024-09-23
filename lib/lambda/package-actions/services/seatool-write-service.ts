import { ConnectionPool, Transaction, connect } from "mssql";
import { buildStatusMemoQuery } from "../../../libs/api/statusMemo";
import { formatSeatoolDate, getSecret } from "shared-utils";
import * as sql from "mssql";

export type IssueRaiDto = {
  id: string;
  today: number;
  spwStatus: string;
};

export type RespondToRaiDto = {
  id: string;
  raiReceivedDate: string;
  raiWithdrawnDate: string;
  today: number;
  raiToRespondTo: number;
  spwStatus: string;
};

export type WithdrawRaiDto = {
  id: string;
  today: number;
  raiToWithdraw: number;
  spwStatus: string;
  raiRequestedDate: string;
  raiReceivedDate: string;
};

export type RemoveAppkChildDto = {
  id: string;
  today: number;
  spwStatus: string;
};

export type WithdrawPackageDto = {
  id: string;
  today: number;
  spwStatus: string;
};

export type UpdateIdDto = {
  id: string;
  today: number;
  spwStatus: string;
  newId: string;
};

let pool: ConnectionPool | null = null;
let transaction: Transaction | null = null;
let sqlConfig: sql.config | null = null;

const getSqlConfig = async (): Promise<sql.config> => {
  if (sqlConfig) {
    return sqlConfig;
  }

  const secretName = process.env.dbInfoSecretName;
  if (!secretName) {
    throw new Error("Environment variable dbInfoSecretName is not set");
  }

  const secret = JSON.parse(await getSecret(secretName));
  const { ip, port, user, password } = secret;

  sqlConfig = {
    user,
    password,
    server: ip,
    port: parseInt(port as string),
    database: "SEA",
  } as sql.config;

  return sqlConfig;
};

export const getTrx = async () => {
  sqlConfig = sqlConfig || (await getSqlConfig());
  pool = pool || (await connect(sqlConfig));
  transaction = transaction || new Transaction(pool);

  return { trx: transaction };
};

export const issueRaiSeatool = async ({
  id,
  spwStatus,
  today,
}: IssueRaiDto) => {
  const { trx } = await getTrx();

  // Issue RAI
  const query1 = `
    Insert into SEA.dbo.RAI (ID_Number, RAI_Requested_Date)
      values ('${id}'
      ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)))
    `;
  await trx.request().query(query1);

  // Update Status
  const query2 = `
    UPDATE SEA.dbo.State_Plan
    SET 
      SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
      Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
      Status_Memo = ${buildStatusMemoQuery(id, "RAI Issued")}
    WHERE ID_Number = '${id}'
    `;
  await trx.request().query(query2);
};

export const respondToRaiSeatool = async ({
  id,
  raiReceivedDate,
  raiWithdrawnDate,
  today,
  raiToRespondTo,
  spwStatus,
}: RespondToRaiDto) => {
  const { trx } = await getTrx();

  let statusMemoUpdate = "";
  if (raiReceivedDate && raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      id,
      `RAI Response Received.  This overwrites the previous response received on ${formatSeatoolDate(
        raiReceivedDate,
      )} and withdrawn on ${formatSeatoolDate(raiWithdrawnDate)}`,
    );
  } else if (raiWithdrawnDate) {
    statusMemoUpdate = buildStatusMemoQuery(
      id,
      `RAI Response Received.  This overwrites a previous response withdrawn on ${formatSeatoolDate(
        raiWithdrawnDate,
      )}`,
    );
  } else {
    statusMemoUpdate = buildStatusMemoQuery(id, "RAI Response Received");
  }

  // Respond to RAI
  const query1 = `
          UPDATE SEA.dbo.RAI
            SET 
              RAI_RECEIVED_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME)),
              RAI_WITHDRAWN_DATE = NULL
            WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToRespondTo}', 10)), CAST('19700101' AS DATETIME))
        `;
  const result1 = await trx.request().query(query1);
  console.log(result1);

  // Update Status
  const query2 = `
          UPDATE SEA.dbo.State_Plan
            SET 
              SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
              Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
              Status_Memo = ${statusMemoUpdate}
            WHERE ID_Number = '${id}'
        `;
  const result2 = await trx.request().query(query2);
  console.log(result2);
};

export const withdrawRaiSeatool = async ({
  id,
  today,
  raiToWithdraw,
  spwStatus,
  raiRequestedDate,
  raiReceivedDate,
}: WithdrawRaiDto) => {
  const { trx } = await getTrx();

  await trx.request().query(`
      UPDATE SEA.dbo.RAI
        SET 
          RAI_WITHDRAWN_DATE = DATEADD(s, CONVERT(int, LEFT('${today}', 10)), CAST('19700101' AS DATETIME))
      WHERE ID_Number = '${id}' AND RAI_REQUESTED_DATE = DATEADD(s, CONVERT(int, LEFT('${raiToWithdraw}', 10)), CAST('19700101' AS DATETIME))
    `);
  // Set Status to Pending - RAI
  await trx.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
          Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
          Status_Memo = ${buildStatusMemoQuery(
            id,
            `RAI Response Withdrawn.  This withdrawal is for the RAI requested on ${formatSeatoolDate(
              raiRequestedDate,
            )} and received on ${formatSeatoolDate(raiReceivedDate)}`,
          )}
        WHERE ID_Number = '${id}'
    `);
};

export const removeAppkChildSeatool = async ({
  id,
  today,
  spwStatus,
}: RemoveAppkChildDto) => {
  const { trx } = await getTrx();

  await trx.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
          Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
          Status_Memo = ${buildStatusMemoQuery(id, "Package Withdrawn")}
        WHERE ID_Number = '${id}'
    `);
};

export const withdrawPackageSeatool = async ({
  id,
  today,
  spwStatus,
}: WithdrawPackageDto) => {
  const { trx } = await getTrx();

  const query = `
        UPDATE SEA.dbo.State_Plan
          SET 
            SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
            Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
            Status_Memo = ${buildStatusMemoQuery(id, "Package Withdrawn")}
          WHERE ID_Number = '${id}'
      `;
  await trx.request().query(query);
};

export const updateIdSeatool = async ({
  id,
  today,
  spwStatus,
  newId,
}: UpdateIdDto) => {
  const { trx } = await getTrx();

  await trx.request().query(
    `
      DECLARE @columns NVARCHAR(MAX), @sql NVARCHAR(MAX), @newId NVARCHAR(50), @originalId NVARCHAR(50);

      SET @newId = '${newId}';
      SET @originalId = '${id}';
      
      SELECT @columns = COALESCE(@columns + ', ', '') + QUOTENAME(column_name)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'State_Plan' AND column_name != 'ID_Number' AND column_name != 'UUID' AND column_name != 'replica_id' AND table_schema = 'dbo'
        ORDER BY ordinal_position;
      
      SET @sql = 'INSERT INTO SEA.dbo.State_Plan (ID_Number, ' + @columns + ') SELECT ''' + @newId + ''' as ID_Number, ' + @columns + ' FROM SEA.dbo.State_Plan WHERE ID_Number = ''' + @originalId + '''';
      EXEC sp_executesql @sql;
    `,
  );

  await trx.request().query(
    `
      INSERT INTO RAI (ID_Number, RAI_REQUESTED_DATE, RAI_RECEIVED_DATE, RAI_WITHDRAWN_DATE)
        SELECT '${newId}', RAI_REQUESTED_DATE, RAI_RECEIVED_DATE, RAI_WITHDRAWN_DATE
        FROM RAI
        WHERE ID_Number = '${id}';
    `,
  );

  await trx.request().query(
    `
      INSERT INTO State_Plan_Service_Types (ID_Number, Service_Type_ID)
        SELECT '${newId}', Service_Type_ID
        FROM State_Plan_Service_Types
        WHERE ID_Number = '${id}';
    `,
  );

  await trx.request().query(
    `
      INSERT INTO State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID)
        SELECT '${newId}', Service_SubType_ID
        FROM State_Plan_Service_SubTypes
        WHERE ID_Number = '${id}';
    `,
  );

  await trx.request().query(
    `
      INSERT INTO Action_Officers (ID_Number, Officer_ID)
        SELECT '${newId}', Officer_ID
        FROM Action_Officers
        WHERE ID_Number = '${id}';
    `,
  );

  await trx.request().query(
    `
      UPDATE SEA.dbo.State_Plan
      SET 
        SPW_Status_ID = (SELECT SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = '${spwStatus}'),
        Status_Date = dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime)),
        Status_Memo = ${buildStatusMemoQuery(
          id,
          `Package Terminated via ID Update: this package was copied to ${newId} and then terminated.`,
        )}
      WHERE ID_Number = '${id}'
    `,
  );

  await trx.request().query(
    `
    UPDATE SEA.dbo.State_Plan
      SET 
        Status_Memo = ${buildStatusMemoQuery(
          id,
          `Package Created via ID Update: this package was copied from ${id}.`,
        )}
      WHERE ID_Number = '${newId}'
    `,
  );
};
