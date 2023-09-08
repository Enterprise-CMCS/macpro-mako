import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";

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

export const submit = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);
    console.log(body);

    const pool = await sql.connect(config);

    const query = `
      Insert into SEA.dbo.State_Plan (ID_Number, State_Code, Region_ID, Plan_Type, Submission_Date, Status_Date, SPW_Status_ID, Budget_Neutrality_Established_Flag)
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
          ,(Select SPW_Status_ID from SEA.dbo.SPW_Status where SPW_Status_DESC = 'Pending')
          ,0)
    `;

    const result = await sql.query(query);
    console.log(result);
    await pool.close();

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
