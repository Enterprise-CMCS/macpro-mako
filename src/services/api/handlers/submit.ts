import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/auth/user";

import { Action, Authority, SEATOOL_AUTHORITIES, onemacSchema } from "shared-types";
import {
  getAvailableActions,
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";
import { buildStatusMemoQuery } from "../libs/statusMemo";
import { produceMessage } from "../libs/kafka";
import { getPackage } from "../libs/package";

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
      Authority["1915c"], // We accept amendments, renewals, and extensions for Cs
  ];
  if (!activeSubmissionTypes.includes(body.authority)) {
    return response({
      statusCode: 400,
      body: {
        message: `OneMAC (micro) Submissions API does not support the following authority: ${body.authority}`,
      },
    });
  }

    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );

    // I think we need to break this file up.  A switch maybe
    if (
      [Authority["1915b"], Authority["1915c"]].includes(body.authority) &&
      body.seaActionType === "Extend"
    ) {
      console.log("Received a new temporary extension sumbission");

      // Check that this action can be performed on the original waiver
      const originalWaiver = await getPackage(body.originalWaiverNumber);
      console.log(originalWaiver);
      const originalWaiverAvailableActions: Action[] = getAvailableActions(
        userAttr,
        originalWaiver._source
      );
      if (!originalWaiverAvailableActions.includes(Action.TEMP_EXTENSION)) {
        const actionType = Action.TEMP_EXTENSION;
        const id = body.originalWaiverNumber;
        console.log(
          `Package ${body.originalWaiverNumber} is not a candidate to receive a Temporary Extension`
        );
        return response({
          statusCode: 401,
          body: {
            message: `You are not authorized to perform ${actionType} on ${id}`,
          },
        });
      }

      // Safe parse the body
      const eventBody = onemacSchema.safeParse(body);
      if (!eventBody.success) {
        return console.log(
          "MAKO Validation Error. The following record failed to parse: ",
          JSON.stringify(eventBody),
          "Because of the following Reason(s): ",
          eventBody.error.message
        );
      }
      console.log(
        "Safe parsed event body" + JSON.stringify(eventBody.data, null, 2)
      );

      await produceMessage(
        process.env.topicName as string,
        body.id,
        JSON.stringify({
          ...eventBody.data,
          submissionDate: getNextBusinessDayTimestamp(),
          statusDate: seaToolFriendlyTimestamp(),
          changedDate: Date.now(),
        })
      );

      return response({
        statusCode: 200,
        body: { message: "success" },
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
    await transaction.begin();
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

    // Resolve the the Plan_Type_ID
    const authorityId = findAuthorityIdByName(body.authority);
    // Resolve the actionTypeID, if applicable
    const actionTypeSelect = [Authority["1915b"], Authority.CHIP_SPA].includes(
      body.authority
    )
      ? `
        SELECT @ActionTypeID = Action_ID FROM SEA.dbo.Action_Types
        WHERE Plan_Type_ID = '${authorityId}'
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
      DECLARE @PlanTypeID INT = ${authorityId}
      
      -- Set your variables
      SELECT @RegionID = Region_ID FROM SEA.dbo.States WHERE State_Code = '${
        body.state
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

function findAuthorityIdByName(authority: string): string | undefined {
  const entries = Object.entries(SEATOOL_AUTHORITIES);
  for (const [key, value] of entries) {
    if (value.toLowerCase() === authority.toLowerCase()) {
      return key;
    }
  }
  // Return undefined if no match is found
  return undefined;
}

export const handler = submit;
