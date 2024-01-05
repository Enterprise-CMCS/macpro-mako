import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import { response } from "@/libs/handler";
import { APIError } from "./services/error-handle-service";

type LambdaConfig<T extends AnyZodObject, TReturn> = {
  schema: T;
  allowedRoles: ("Test" | "Admin")[];
  event: APIGatewayEvent;
  lambda: (data: z.infer<T>) => Promise<TReturn>;
};

export const handleEvent = async <T extends AnyZodObject, TReturn>({
  event,
  schema,
  lambda,
  allowedRoles,
}: LambdaConfig<T, TReturn>) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const result = schema.safeParse(body);

    if (result.success === true) {
      // give lambda access to response
      // give lambda access to kafka
      return await lambda(result.data);
    } else {
      // return a bad response
      return response({
        statusCode: 500,
        body: {
          error: result.error.message,
        },
      });
    }
  } catch (err: unknown) {
    console.error(err);
  }
};

const handler = async (event: APIGatewayEvent) => {
  return await handleEvent({
    event,
    allowedRoles: ["Admin"],
    schema: z.object({
      testString: z.string(),
    }),
    async lambda(data) {
      return response({
        statusCode: 200,
        body: {
          message: "successful write to sea",
        },
      });
    },
  });
};
