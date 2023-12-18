import { type config } from "mssql";

export const seatoolConnection: config = {
  user: process.env.dbUser!,
  password: process.env.dbPassword!,
  server: process.env.dbIp!,
  port: +(process.env.dbPort as string),
  database: "SEA",
};
