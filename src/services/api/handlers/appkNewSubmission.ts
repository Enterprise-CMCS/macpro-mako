import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "../libs/auth/user";

import { onemacSchema } from "shared-types";
import {
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";
import { produceMessage } from "../libs/kafka";

export const submit = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: "Event body required",
      });
    }
    const body = JSON.parse(event.body);

    if (!(await isAuthorized(event, body.state))) {
      return response({
        statusCode: 403,
        body: { message: "Unauthorized" },
      });
    }

    const today = seaToolFriendlyTimestamp();
    const submissionDate = getNextBusinessDayTimestamp();
    const pool = await sql.connect({
      user: process.env.dbUser,
      password: process.env.dbPassword,
      server: process.env.dbIp as string,
      port: parseInt(process.env.dbPort as string),
      database: "SEA",
    });

    // APP_K
    const waiverIds = body.waiverIds as string[];

    const seatoolWaivers = body.waiverIds.map(async (WID: string) => {
      await sql.query(`
        Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Action_Type, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
          values (
            '${`${body.state}-${WID}`}'
            ,'${body.state}'
            ,(SELECT Action_ID
              FROM SEA.dbo.Action_Types
              WHERE Action_Name = '${body.seaActionType}'
              AND Plan_Type_ID = (
                SELECT Plan_Type_ID
                FROM SEA.dbo.Plan_Types
                WHERE Plan_Type_Name = '${body.authority}'
              ))
            ,(Select Region_ID from SEA.dbo.States where State_Code = '${
              body.state
            }')
            ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${
              body.authority
            }')
            ,dateadd(s, convert(int, left(${submissionDate}, 10)), cast('19700101' as datetime))
            ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
            ,dateadd(s, convert(int, left(${
              body.proposedEffectiveDate
            }, 10)), cast('19700101' as datetime))
            ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
            ,0
          )
      `);
    });

    await Promise.all(seatoolWaivers);

    await pool.close();
    const kafkaWaivers = waiverIds.map(async (WID, index) => {
      const data = {
        ...body,
        ...(!!index && { appkParentId: `${body.state}-${waiverIds[0]}` }),
      };

      const eventBody = onemacSchema.safeParse(data);
      if (!eventBody.success) {
        return console.log(
          "MAKO Validation Error. The following record failed to parse: ",
          JSON.stringify(eventBody),
          "Because of the following Reason(s): ",
          eventBody.error.message
        );
      }

      return await produceMessage(
        process.env.topicName as string,
        `${body.state}-${WID}`,
        JSON.stringify(eventBody.data)
      );
    });

    await Promise.all(kafkaWaivers);

    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = submit;
