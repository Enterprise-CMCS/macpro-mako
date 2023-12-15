import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import knex, { type Knex } from "knex";

const connectionConfig: Knex.Config = {};

type LambdaConfig<T extends AnyZodObject, TReturn> = {
  schema: T;
  allowedRoles: ("Test" | "Admin")[];
  event: APIGatewayEvent;
  lambda: (data: z.infer<T>, connection: Knex) => Promise<TReturn>;
};

const handleEvent = async <T extends AnyZodObject, TReturn>({
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
    return {};
  }
};

const testLamdaHandler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: ["Admin"],
    schema: z.object({
      testString: z.string(),
    }),
    async lambda(data, db) {
      const test = await db.first("*").from<typeof data>("something");
      return 1;
    },
  });
};
