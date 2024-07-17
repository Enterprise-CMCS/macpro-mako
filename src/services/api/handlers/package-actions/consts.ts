const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort as string);

import * as sql from "mssql";

export const config = {
  user: user,
  password: password,
  server: server,
  port: port,
  database: "SEA",
} as sql.config;

export const TOPIC_NAME = process.env.topicName as string;
