import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import knex, { type Knex } from "knex";

const connectionConfig: Knex.Config = {};

type LambdaConfig<T extends AnyZodObject, TReturn> = {
  schema: T;
  allowedRoles: ("Test" | "Admin")[];
  lambda: (data: z.infer<T>, connection: Knex) => Promise<TReturn>;
};

const handleEvent =
  (event: APIGatewayEvent) =>
  async <T extends AnyZodObject, TReturn>({
    schema,
    lambda,
    allowedRoles,
  }: LambdaConfig<T, TReturn>) => {
    const body = JSON.parse(event.body ?? "{}");
    const result = schema.safeParse(body);
    const k = knex(connectionConfig);

    if (result.success === true) {
      return await lambda(result.data, k);
    } else {
      return {};
    }
  };

const testLamdaHandler = async (event: APIGatewayEvent) => {
  const test = await handleEvent(event)({
    allowedRoles: ["Admin"],
    schema: z.object({
      testString: z.string(),
    }),
    async lambda(data, db) {
      db.select("*").from<typeof data>("something");
      const test = await db.select("*").from("user");
      return 1;
    },
  });
};
