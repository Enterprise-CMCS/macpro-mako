import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import knex, { KnexTimeoutError, type Knex } from "knex";
import { response } from "@/libs/handler";

const user = process.env.dbUser;
const password = process.env.dbPassword;
const server = process.env.dbIp;
const port = parseInt(process.env.dbPort as string);

const connectionConfig: Knex.Config = {
  client: "mssql",
  connection: {
    user,
    password,
    server,
    port,
    database: "SEA",
  },
};

type LambdaConfig<T extends AnyZodObject, TReturn> = {
  schema: T;
  allowedRoles: ("Test" | "Admin")[];
  event: APIGatewayEvent;
  lambda: (data: z.infer<T>, connection: Knex) => Promise<TReturn>;
};

export const handleEvent = async <T extends AnyZodObject, TReturn>({
  event,
  schema,
  lambda,
  allowedRoles,
}: LambdaConfig<T, TReturn>) => {
  const body = JSON.parse(event.body ?? "{}");
  const result = schema.safeParse(body);
  const k = knex(connectionConfig);

  if (result.success === true) {
    // give lambda access to response
    // give lambda access to kafka
    return await lambda(result.data, k);
  } else {
    // return a bad response
    return response({
      statusCode: 500,
      body: {
        error: result.error.message,
      },
    });
  }
};

const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: ["Admin"],
    schema: z.object({
      testString: z.string(),
    }),
    async lambda(data, db) {
      try {
        const dbQuery = await db.select("*").from("something");

        return response({
          statusCode: 200,
          body: {
            message: "successful write to sea",
          },
        });
      } catch (err: unknown) {
        console.error(err);

        return response({
          statusCode: 500,
          body: { message: "failed sea sync" },
        });
      }
    },
  });
};
