import { ConnectionPool, Transaction, config, connect } from "mssql";
import { buildStatusMemoQuery } from "../../../libs/statusMemo";

export type CompleteIntakeDto = {
  id: string;
  typeIds: number[];
  subTypeIds: number[];
  subject: string;
  description: string;
  cpoc: number;
  submitterName: string;
};

export class SeatoolWriteService {
  #pool: ConnectionPool;
  trx: Transaction;

  constructor(pool: ConnectionPool) {
    this.#pool = pool;
    this.trx = new Transaction(pool);
  }

  async createSeatoolService(config: config) {
    const pool = await connect(config);

    return new SeatoolWriteService(pool);
  }

  async completeIntake({
    typeIds,
    subTypeIds,
    id,
    cpoc,
    description,
    subject,
    submitterName,
  }: CompleteIntakeDto) {
    // Generate INSERT statements for typeIds
    const typeIdsValues = typeIds
      .map((typeId: number) => `('${id}', '${typeId}')`)
      .join(",\n");
    const typeIdsInsert = typeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_Types (ID_Number, Service_Type_ID) VALUES ${typeIdsValues};`
      : "";

    // Generate INSERT statements for subTypeIds
    const subTypeIdsValues = subTypeIds
      .map((subTypeId: number) => `('${id}', '${subTypeId}')`)
      .join(",\n");

    const subTypeIdsInsert = subTypeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID) VALUES ${subTypeIdsValues};`
      : "";

    await this.trx.request().query(`
      UPDATE SEA.dbo.State_Plan
        SET 
          Title_Name = ${subject ? `'${subject.replace("'", "''")}'` : "NULL"},
          Summary_Memo = ${
            description ? `'${description.replace("'", "''")}'` : "NULL"
          },
          Lead_Analyst_ID = ${cpoc ? cpoc : "NULL"},
          Status_Memo = ${buildStatusMemoQuery(id, `Intake Completed:  Intake was completed by ${submitterName}`)}
        WHERE ID_Number = '${id}'

        -- Insert all types into State_Plan_Service_Types
        ${typeIdsInsert}

        -- Insert all types into State_Plan_Service_SubTypes
        ${subTypeIdsInsert}
    `);
  }
}
