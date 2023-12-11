import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "../libs/auth/user";

const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort);
const config = {
  user: user,
  password: password,
  server: server,
  port: port,
  database: "SEA",
};

import { Kafka, Message } from "kafkajs";
import { Authority, onemacSchema, transformOnemac } from "shared-types";

const kafka = new Kafka({
  clientId: "submit",
  brokers: process.env.brokerString.split(","),
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
    const body = JSON.parse(event.body);
    console.log(body);

    if (!(await isAuthorized(event, body.state))) {
      return response({
        statusCode: 403,
        body: { message: "Unauthorized" },
      });
    }

    if (body.authority !== Authority.MED_SPA) {
      return response({
        statusCode: 400,
        body: {
          message:
            "The Mako Submissions API only supports Medicaid SPA at this time",
        },
      });
    }

    const pool = await sql.connect(config);
    console.log(body);
    const query = `
      Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
        values ('${body.id}'
          ,'${body.state}'
          ,(Select Region_ID from SEA.dbo.States where State_Code = '${
            body.state
          }')
          ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${
            body.authority
          }')
          ,dateadd(s, convert(int, left(${Date.now()}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${Date.now()}, 10)), cast('19700101' as datetime))
          ,dateadd(s, convert(int, left(${
            body.proposedEffectiveDate
          }, 10)), cast('19700101' as datetime))
          ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
          ,0)
    `;

    const result = await sql.query(query);
    console.log(result);

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
        process.env.topicName,
        body.id,
        JSON.stringify(eventBody)
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

async function produceMessage(topic, key, value) {
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
