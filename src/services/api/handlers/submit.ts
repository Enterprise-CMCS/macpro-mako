import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "../libs/auth/user";

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

import { Kafka, Message } from "kafkajs";
import { PlanType, onemacSchema } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";
import { buildStatusMemoQuery } from "../libs/statusMemo";

const kafka = new Kafka({
  clientId: "submit",
  brokers: process.env.brokerString?.split(",") as string[],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

const producer = kafka.producer();

export const submit = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: "Event body required",
      });
    }
    const body = JSON.parse(event.body);
    console.log(body);

    if (!(await isAuthorized(event, body.state))) {
      return response({
        statusCode: 403,
        body: { message: "Unauthorized" },
      });
    }

    const activeSubmissionTypes = [
      PlanType.CHIP_SPA,
      PlanType.MED_SPA,
      PlanType["1915b"],
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
    const pool = await sql.connect(config);
    console.log(body);
    const query = `
      DECLARE @RegionID INT;
      DECLARE @PlanTypeID INT;
      DECLARE @SPWStatusID INT;
      DECLARE @SubmissionDate DATETIME;
      DECLARE @StatusDate DATETIME;
      DECLARE @ProposedDate DATETIME;
      
      -- Set your variables
      SELECT @RegionID = Region_ID FROM SEA.dbo.States WHERE State_Code = '${body.state}';
      SELECT @PlanTypeID = Plan_Type_ID FROM SEA.dbo.Plan_Types WHERE Plan_Type_Name = '${body.authority}';
      SELECT @SPWStatusID = SPW_Status_ID FROM SEA.dbo.SPW_Status WHERE SPW_Status_DESC = 'Pending';
      
      SET @SubmissionDate = DATEADD(s, CONVERT(INT, LEFT(${submissionDate}, 10)), CAST('19700101' as DATETIME));
      SET @StatusDate = DATEADD(s, CONVERT(INT, LEFT(${today}, 10)), CAST('19700101' as DATETIME));
      SET @ProposedDate = DATEADD(s, CONVERT(INT, LEFT(${body.proposedEffectiveDate}, 10)), CAST('19700101' as DATETIME));
      
      -- Main insert into State_Plan
      INSERT INTO SEA.dbo.State_Plan (ID_Number, State_Code, Title_Name, Summary_Memo, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
      VALUES ('${body.id}', '${body.state}', '${body.subject}', '${body.description}', @RegionID, @PlanTypeID, @SubmissionDate, @StatusDate, @ProposedDate, @SPWStatusID, 0);
      
    `;

    // -- Insert into State_Plan_Service_SubTypes
    // INSERT INTO State_Plan_Service_SubTypes (ID_Number, Service_SubType_ID)
    // VALUES ('${body.id}', '${body.serviceSubTypeId}');

    // -- Insert into State_Plan_Services_Type
    // INSERT INTO State_Plan_Services_Type (ID_Number, Service_Type_ID)
    // VALUES ('${body.id}', '${body.serviceTypeId}');

    const result = await sql.query(query);
    console.log(result);
    if (body.authority == PlanType["1915b"]) {
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
      const actionTypeQueryResult = await sql.query(actionTypeQuery);
      console.log(actionTypeQueryResult);
    }

    const statusMemoUpdate = await sql.query(
      buildStatusMemoQuery(body.id, "Package Submitted")
    );
    console.log(statusMemoUpdate);

    await pool.close();

    const eventBody = onemacSchema.safeParse(body);
    if (eventBody.success === false) {
      console.log(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(eventBody),
        "Because of the following Reason(s): ",
        eventBody.error.message
      );
    } else {
      console.log(eventBody);
      await produceMessage(
        process.env.topicName as string,
        body.id,
        JSON.stringify(eventBody.data)
      );

      return response({
        statusCode: 200,
        body: { message: "success" },
      });
    }
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

async function produceMessage(topic: string, key: string, value: string) {
  console.log("about to connect");
  await producer.connect();
  console.log("connected");

  const message: Message = {
    key: key,
    value: value,
    partition: 0,
    headers: { source: "micro" },
  };
  console.log(message);

  try {
    await producer.send({
      topic,
      messages: [message],
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    await producer.disconnect();
  }
}

export const handler = submit;
