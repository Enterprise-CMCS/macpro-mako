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
import { search } from "../../../libs/opensearch-lib";

export const submit = async (event: APIGatewayEvent) => {
  // reject no body
  /**
    state: z.string(),
    parentWaiver: zAppkWaiverNumberSchema,
    childWaivers: z.array(zAppkWaiverNumberSchema),
    additionalInformation: z.string().max(4000).optional(),
    title: z.string(),
    attachments: z.object({
      appk: zAttachmentRequired({ min: 1 }),
      other: zAttachmentRequired({ min: 1 }),
    }),
    proposedEffectiveDate: z.date(),
    seaActionType: z.string().default("Amend"),
   */
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

  const waiverIds = [body.parentWaiver, ...body.childWaivers] as string[];
  const schemas = [];

  for (const WINDEX in waiverIds) {
    const ID = waiverIds[WINDEX].trim();
    const validateRegex = /^\d{4,5}\.R\d{2}\.\d{2}$/.test(ID);
    // Reject invalid ID
    if (!validateRegex) {
      throw console.error(
        "MAKO Validation Error. The following APP-K Id format is incorrect: ",
        ID,
      );
    }

    const validateZod = onemacSchema.safeParse({
      ...body,
      ...(!!Number(WINDEX) && {
        appkParentId: `${body.state}-${body.parentWaiver}`,
      }),
      ...(!Number(WINDEX) && {
        appkTitle: body.title,
      }),
    });

    if (!validateZod.success) {
      throw console.error(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(validateZod),
        "Because of the following Reason(s): ",
        validateZod.error.message,
      );
    }

    const validateOpensearch = await search(process.env.osDomain!, "main", {
      query: { match_phrase: { id: { query: `${body.state}-${ID}` } } },
    });
    const existsInOpensearch = validateOpensearch?.hits.total.value !== 0;
    if (existsInOpensearch) {
      throw console.error(
        "MAKO Validation Error. The following APP-K Id already exists ",
        `${body.state}-${ID}`,
      );
    }

    schemas.push({ data: validateZod.data, id: `${body.state}-${ID}` });
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
      const SCHEMA = schemas[Number(WINDEX)];
      await produceMessage(
        process.env.topicName as string,
        SCHEMA.id,
        JSON.stringify(SCHEMA.data),
      );
    }

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
