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
import { PlanType, onemacSchema, transformOnemac } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";
import { z } from "zod";

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

const initialWaiverSubmissionSchema = z.object({
  waiverNumber: z.string(),
  state: z.string(),
  authority: z.nativeEnum(PlanType),
  proposedEffectiveDate: z.number(),
});

const initialSpaSchema = z.object({
  waiverNumber: z.string(),
  state: z.string(),
  authority: z.nativeEnum(PlanType),
  proposedEffectiveDate: z.number(),
});

export const submit = async (event: APIGatewayEvent) => {
  console.log("testing");
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
    const pool = await sql.connect(config);
    console.log(body);

    const formattedSpaTypeName: Record<string, string> = {
      [PlanType["1915b"]]: "1915 (b) Waiver",
      // [PlanType["1915c"]]: "1915 (c) Waiver",
    };

    console.log("body is here", JSON.stringify(body));

    const spaQuery = (body: any) => `
      Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
        values ('${body.id}'
          ,'${body.state}'
          ,(Select Region_ID from SEA.dbo.States where State_Code = '${body.state}')
          ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${body.authority}')
          ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${body.proposedEffectiveDate}, 10)), cast('19700101' as datetime))
          ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
          ,0)
    `;

    // These below two queries will become useful when it comes to updating the plan type and plan sub type for waiver
    // and probably also chip spas, and medicaid spas

    // const statePlanTypeQuery = `
    // INSERT INTO SEA.dbo.State_Plan_Service_Types (id_number, service_type_id) VALUES ('${
    //   body.id
    // }', (Select SPA_Type_ID from dbo.SPA_Type where SPA_Type_Name = '${
    //   formattedSpaTypeName[body.authority as PlanType]
    // }'))
    // `;

    // const statePlanSubTypeQuery = `
    // INSERT INTO SEA.dbo.State_Plan_Service_SubTypes (id_number, Service_SubType_ID) VALUES ('${body.id}', (Select SPA_Type_ID from dbo.Type where SPA_Type_Name = '1915 (b) (1)'))
    // `;

    const statePlanWaiverQuery = (
      body: z.infer<typeof initialWaiverSubmissionSchema>
    ) => `
    Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
      values ('${body.waiverNumber}'
        ,'${body.state}'
        ,(Select Region_ID from SEA.dbo.States where State_Code = '${body.state}')
        ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${body.authority}')
        ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
        ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
        ,dateadd(s, convert(int, left(${body.proposedEffectiveDate}, 10)), cast('19700101' as datetime))
        ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
        ,0
        )
  `;

    const queries: Record<
      PlanType,
      { query: (body: any) => string; schema: z.AnyZodObject }[]
    > = {
      [PlanType.CHIP_SPA]: [{ query: spaQuery, schema: initialSpaSchema }],
      [PlanType.MED_SPA]: [{ query: spaQuery, schema: initialSpaSchema }],
      [PlanType["1915b"]]: [
        { query: statePlanWaiverQuery, schema: initialWaiverSubmissionSchema },
      ],
      [PlanType["1915c"]]: [],
      [PlanType.WAIVER]: [
        { query: statePlanWaiverQuery, schema: initialWaiverSubmissionSchema },
      ],
    };

    console.log("two things", body.authority, queries);

    for (const query of queries[body.authority as PlanType]) {
      try {
        const result = query.schema.safeParse(body);

        if (result.success === true) {
          const queryResult = await sql.query(query.query(result.data));

          console.log("the output of the query is the following", queryResult);
        } else {
          console.error(
            "failed to parse the payload for submission",
            result.error
          );
          return response({
            statusCode: 500,
            body: {
              message: "an error occured",
            },
          });
        }

        console.log(result);
      } catch (error: unknown) {
        console.error(error);
      }
    }

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
        body.id || body.waiverNumber,
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
