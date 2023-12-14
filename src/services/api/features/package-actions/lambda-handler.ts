import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import knex, { type Knex } from "knex";

const connectionConfig: Knex.Config = {};

const handleEvent =
  (event: APIGatewayEvent) =>
  async <T extends AnyZodObject>({
    schema,
    lambda,
    allowedRoles,
  }: {
    schema: T;
    allowedRoles: ("Test" | "Admin")[];
    lambda: (data: z.infer<T>, connection: Knex) => Promise<void>;
  }) => {
    const body = JSON.parse(event.body ?? "{}");
    const result = schema.safeParse(body);
    const k = knex({});

    if (result.success === true) {
      await lambda(result.data, k);
    } else {
      return {};
    }
  };

const testLamdaHandler = (event: APIGatewayEvent) =>
  handleEvent(event)({
    allowedRoles: ["Admin"],
    schema: z.object({
      testString: z.string(),
    }),
    async lambda(data, db) {
      const test = await db.select("*").from("user");
    },
  });
