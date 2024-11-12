import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "libs/api/auth/user";

import { events } from "shared-types";
import { getSecret, getNextBusinessDayTimestamp, seaToolFriendlyTimestamp } from "shared-utils";
import { produceMessage } from "libs/api/kafka";
import { search } from "libs/opensearch-lib";

let config: sql.config;
const secretName = process.env.dbInfoSecretName;
if (!secretName) {
  throw new Error("Environment variable dbInfoSecretName is not set");
}

export const submit = async (event: APIGatewayEvent) => {
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

  const secret = JSON.parse(await getSecret(secretName));
  const { ip, port, user, password } = secret;
  config = {
    user,
    password,
    server: ip,
    port: parseInt(port as string),
    database: "SEA",
  } as sql.config;

  const schemas = [];
  console.log("IDS??");
  console.log(body.waiverIds, "IDS");
  for (const WINDEX in body.waiverIds) {
    const ID = body.waiverIds[WINDEX].trim();
    const validateRegex = /^\d{4,5}\.R\d{2}\.\d{2}$/.test(ID);
    // Reject invalid ID
    if (!validateRegex) {
      throw console.error(
        "MAKO Validation Error. The following APP-K Id format is incorrect: ",
        ID,
      );
    }

    const notificationMetadata = {
      submissionDate: getNextBusinessDayTimestamp(),
      proposedEffectiveDate: body.proposedEffectiveDate,
    };

    const validateZod = events["app-k"].schema.safeParse({
      ...body,
      ...(!!Number(WINDEX) && {
        appkParentId: `${body.state}-${body.waiverIds[0]}`,
      }),
      ...(!Number(WINDEX) && {
        appkTitle: body.title,
        appkParent: true,
      }),
      notificationMetadata,
    });

    if (!validateZod.success) {
      throw console.error(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(validateZod),
        "Because of the following Reason(s): ",
        validateZod.error.message,
      );
    }

    const validateOpensearch = await search(
      process.env.osDomain!,
      `${process.env.indexNamespace}main`,
      {
        query: { match_phrase: { id: { query: `${body.state}-${ID}` } } },
      },
    );
    const existsInOpensearch = validateOpensearch?.hits.total.value !== 0;
    if (existsInOpensearch) {
      throw console.error(
        "MAKO Validation Error. The following APP-K Id already exists ",
        `${body.state}-${ID}`,
      );
    }

    schemas.push({ data: validateZod.data, id: `${body.state}-${ID}` });
  }

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  console.log("before try");
  try {
    console.log("in try");
    await transaction.begin();

    const dates = {
      status: seaToolFriendlyTimestamp(),
      submission: getNextBusinessDayTimestamp(),
      effectiveDate: body.proposedEffectiveDate,
    };

    for (const WINDEX in body.waiverIds) {
      await transaction.request().query(`
      Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Action_Type, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
        values (
          '${`${body.state}-${body.waiverIds[WINDEX]}`}'
          ,'${body.state}'
          ,(SELECT Action_ID
            FROM SEA.dbo.Action_Types
            WHERE Action_Name = '${body.seaActionType}'
            AND Plan_Type_ID = (
              SELECT Plan_Type_ID
              FROM SEA.dbo.Plan_Types
              WHERE Plan_Type_Name = '${body.authority}'
            ))
          ,(Select Region_ID from SEA.dbo.States where State_Code = '${body.state}')
          ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${body.authority}')
          ,dateadd(s, convert(int, left(${dates.submission}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${dates.status}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${dates.effectiveDate}, 10)), cast('19700101' as datetime))
          ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
          ,0
        )
      `);
    }

    await transaction.commit();

    // for await const kafka events
    for (const WINDEX in schemas) {
      const SCHEMA = schemas[Number(WINDEX)];
      await produceMessage(process.env.topicName as string, SCHEMA.id, JSON.stringify(SCHEMA.data));
    }

    return response({ statusCode: 200, body: { message: "success" } });
  } catch (error) {
    console.error({ error });
    await transaction.rollback();
    return response({
      statusCode: 500,
      body: { message: "Failed from new appK submission" },
    });
  } finally {
    await pool.close();
  }
};

export const handler = submit;
