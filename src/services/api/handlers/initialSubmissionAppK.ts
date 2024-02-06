import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";
import { isAuthorized } from "../libs/auth/user";

const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort as string);

import { Kafka, Message } from "kafkajs";
import { onemacSchema } from "shared-types";
import { seaToolFriendlyTimestamp } from "shared-utils";

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

    if (!(await isAuthorized(event, body.state))) {
      return response({
        statusCode: 403,
        body: { message: "Unauthorized" },
      });
    }

    const today = seaToolFriendlyTimestamp();
    const pool = await sql.connect({
      user: user,
      password: password,
      server: server as string,
      port: port,
      database: "SEA",
    });

    // APP_K
    const waiverIds = body.waiverIds as string[];
    const seatoolWaivers = body.waiverIds.map(async (WID: string) => {
      return await sql.query(
        `INSERT INTO SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, Status_Date, Proposed_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
            values ('${`${body.state}-${WID}`}'
            ,'${body.state}'
            ,(Select Region_ID from SEA.dbo.States where State_Code = '${
              body.state
            }')
            ,(Select Plan_Type_ID from SEA.dbo.Plan_Types where Plan_Type_Name = '${
              body.authority
            }')
            ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
            ,dateadd(s, convert(int, left(${today}, 10)), cast('19700101' as datetime))
            ,dateadd(s, convert(int, left(${
              body.proposedEffectiveDate
            }, 10)), cast('19700101' as datetime))
            ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
            ,0)
        `
      );
    });

    await Promise.all(seatoolWaivers);

    await pool.close();
    const parentId = waiverIds[0];
    const kafkaWaivers = waiverIds.map(async (WID, index) => {
      const data = {
        authority: "",
        origin: "micro",
        additionalInformation: body.additionalInformation,
        submitterName: body.submitterName,
        submitterEmail: body.submitterEmail,
        attachments: body.attachments,
        ...(!!index && { parentId }),
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
