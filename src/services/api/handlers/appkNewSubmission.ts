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
  // reject no body
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }
  const body = JSON.parse(event.body);

  // reject not authorized
  if (!(await isAuthorized(event, body.state))) {
    return response({
      statusCode: 403,
      body: { message: "Unauthorized" },
    });
  }
  const waiverIds = body.waiverIds as string[];

  const parentWaiver = waiverIds[0];
  const schemas = [];
  for (const WINDEX in waiverIds) {
    const ID = waiverIds[WINDEX];
    const validID = /\d{4,5}\.R\d{2}\.\d{2}$/.test(ID);
    // Reject invalid ID
    if (!validID) {
      throw console.error(
        "MAKO Validation Error. The following waiver id format is incorrect: ",
        ID
      );
    }

    const validParse = onemacSchema.safeParse({
      ...body,
      ...(!!WINDEX && { appkParentId: `${body.state}-${parentWaiver}` }),
    });
    // reject invalid parse
    if (!validParse.success) {
      throw console.error(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(validParse),
        "Because of the following Reason(s): ",
        validParse.error.message
      );
    }

    schemas.push({ data: validParse.data, id: ID });
  }

  const pool = await sql.connect({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    server: process.env.dbIp as string,
    port: parseInt(process.env.dbPort as string),
    database: "SEA",
  });
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const dates = {
      status: seaToolFriendlyTimestamp(),
      submission: getNextBusinessDayTimestamp(),
      effectiveDate: body.proposedEffectiveDate,
    };

    for (const WINDEX in waiverIds) {
      await transaction.request().query(`
      Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Action_Type, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
        values (
          '${`${body.state}-${waiverIds[WINDEX]}`}'
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
          ,dateadd(s, convert(int, left(${
            dates.submission
          }, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${
            dates.status
          }, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${
            dates.effectiveDate
          }, 10)), cast('19700101' as datetime))
          ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
          ,0
        )
      `);
    }

    await transaction.commit();

    // for await const kafka events
    for (const WINDEX in schemas) {
      const SCHEMA = schemas[WINDEX];
      await produceMessage(
        process.env.topicName as string,
        `${body.state}-${SCHEMA.id}`,
        JSON.stringify(SCHEMA.data)
      );
    }

    // const kafkaWaivers = schemas.map(async (SCHEMA) => {
    //   return await produceMessage(
    //     process.env.topicName as string,
    //     `${body.state}-${SCHEMA.id}`,
    //     JSON.stringify(SCHEMA.data)
    //   );
    // });

    // const kafkaResponses = await Promise.allSettled(kafkaWaivers);
    // for (const RESPONSE of kafkaResponses) {
    //   if (RESPONSE.status === "fulfilled") continue;
    //   throw new Error(RESPONSE.reason);
    // }

    return response({ statusCode: 200, body: { message: "success" } });
  } catch (error) {
    console.error({ error });
    await transaction.rollback();
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  } finally {
    await pool.close();
  }
};

export const handler = submit;
