import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as sql from "mssql";

export const submit = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);
    console.log(body);

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

    const pool = await sql.connect(config);
    const result = await sql.query`SELECT * FROM sys.tables;`;
    console.log(result);
    await pool.close();

    return response({
      statusCode: 200,
      body: { message: "totally" },
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
