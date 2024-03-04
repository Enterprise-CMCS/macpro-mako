import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "../libs/auth/user";

import { Authority, onemacSchema } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";
import { buildStatusMemoQuery } from "../libs/statusMemo";
import { produceMessage } from "../libs/kafka";
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

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  // TODO: We should really type this, is would be hard, but not impossible
  const body = JSON.parse(event.body);
  console.log(body);

  if (!(await isAuthorized(event, body.state))) {
    return response({
      statusCode: 403,
      body: { message: "Unauthorized" },
    });
  }

  const activeSubmissionTypes = [
    Authority.CHIP_SPA,
    Authority.MED_SPA,
    Authority["1915b"],
  ];
  if (!activeSubmissionTypes.includes(body.authority)) {
    return response({
      statusCode: 400,
      body: {
        message: `OneMAC (micro) Submissions API does not support the following authority: ${body.authority}`,
      },
    });
  }

  const today = seaToolFriendlyTimestamp();
  const submissionDate = getNextBusinessDayTimestamp();
  console.log(
    "Initial Submission Date determined to be: " +
      new Date(submissionDate).toISOString()
  );

  // Open the connection pool and transaction outside of the try/catch/finally
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  // Begin writes
  try {
    // We first parse the event; if it's malformed, this will throw an error before we touch seatool or kafka
    const eventBody = onemacSchema.safeParse(body);
    if (!eventBody.success) {
      return console.log(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(eventBody),
        "Because of the following Reason(s): ",
        eventBody.error.message
      );
    }

    // Resolve the actionTypeID, if applicable
    const actionTypeSelect = [Authority["1915b"], Authority.CHIP_SPA].includes(
      body.authority
    )
      ? `
        SELECT @ActionTypeID = Action_ID FROM SEA.dbo.Action_Types
        WHERE Plan_Type_Name = '${body.authority}'
        AND Action_Name = '${body.seaActionType}';
      `
      : "SET @ActionTypeID = NULL;";

    // Generate INSERT statements for typeIds
    const typeIdsValues = body.typeIds
      .map((typeId: number) => `('${body.id}', '${typeId}')`)
      .join(",\n");

    const typeIdsInsert = typeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_Types (ID_Number, Service_Type_ID) VALUES ${typeIdsValues};`
      : "";

    // Generate INSERT statements for subTypeIds
    const subTypeIdsValues = body.subTypeIds
      .map((subTypeId: number) => `('${body.id}', '${subTypeId}')`)
      .join(",\n");

    const subTypeIdsInsert = subTypeIdsValues
      ? `INSERT INTO SEA.dbo.State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID) VALUES ${subTypeIdsValues};`
      : "";

    const query = `
      DECLARE @RegionID INT;
      DECLARE @PlanTypeID INT;
      DECLARE @SPWStatusID INT;
      DECLARE @ActionTypeID INT;
      DECLARE @SubmissionDate DATETIME;
      DECLARE @StatusDate DATETIME;
      DECLARE @ProposedDate DATETIME;
      DECLARE @TitleName NVARCHAR(MAX) = ${
        body.subject ? `'${body.subject.replace("'", "''")}'` : "NULL"
      };
      DECLARE @SummaryMemo NVARCHAR(MAX) = ${
        body.description ? `'${body.description.replace("'", "''")}'` : "NULL"
      };
      DECLARE @StatusMemo NVARCHAR(MAX) = ${buildStatusMemoQuery(
        body.id,
        "Package Submitted",
        "insert"
      )}
      
      -- Set your variables
      SELECT @RegionID = Region_ID FROM SEA.dbo.States WHERE State_Code = '${
        body.state
      }';
      SELECT @PlanTypeID = Plan_Type_ID FROM SEA.dbo.Plan_Types WHERE Plan_Type_Name = '${
        body.authority
      }';
      SELECT @SPWStatusID = SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = 'Pending';
      -- Set ActionTypeID if applicale, using the conditionally set statement generated previously
      ${actionTypeSelect}

      SET @SubmissionDate = DATEADD(s, CONVERT(INT, LEFT(${submissionDate}, 10)), CAST('19700101' as DATETIME));
      SET @StatusDate = DATEADD(s, CONVERT(INT, LEFT(${today}, 10)), CAST('19700101' as DATETIME));
      SET @ProposedDate = DATEADD(s, CONVERT(INT, LEFT(${
        body.proposedEffectiveDate
      }, 10)), CAST('19700101' as DATETIME));

      -- Main insert into State_Plan
      INSERT INTO SEA.dbo.State_Plan (ID_Number, State_Code, Title_Name, Summary_Memo, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag, Status_Memo, Action_Type)
      VALUES ('${body.id}', '${body.state}', @TitleName, @SummaryMemo, @RegionID, @PlanTypeID, @SubmissionDate, @StatusDate, @ProposedDate, @SPWStatusID, 0, @StatusMemo, @ActionTypeID);

      -- Insert all types into State_Plan_Service_Types
      ${typeIdsInsert}

      -- Insert all types into State_Plan_Service_SubTypes
      ${subTypeIdsInsert}
  `;

    const result = await transaction.request().query(query);
    console.log(result);
    if ([Authority["1915b"], Authority.CHIP_SPA].includes(body.authority)) {
      const actionTypeQuery = `
      UPDATE sp
      SET sp.Action_Type = at.Action_ID
      FROM SEA.dbo.State_Plan sp
      INNER JOIN SEA.dbo.Action_Types at ON at.Plan_Type_ID = (
          SELECT pt.Plan_Type_ID
          FROM SEA.dbo.Plan_Types pt
          WHERE pt.Plan_Type_Name = '${body.authority}'
      )
      WHERE at.Action_Name = '${body.seaActionType}'
      AND sp.ID_Number = '${body.id}';
      
      `;
      const actionTypeQueryResult = await transaction
        .request()
        .query(actionTypeQuery);
      console.log(actionTypeQueryResult);
    }

    // await pool.close();

    // Write to kafka, before we commit our seatool transaction.
    // This way, if we have an error making the kafka write, the seatool changes are rolled back.
    await produceMessage(
      process.env.topicName as string,
      body.id,
      JSON.stringify(eventBody.data)
    );

    // Commit transaction if we've made it this far
    await transaction.commit();

    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (err) {
    // Rollback and log
    await transaction.rollback();
    console.error("Error when interacting with seatool or kafka:", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  } finally {
    // Close pool
    await pool.close();
  }
};

export const handler = submit;
