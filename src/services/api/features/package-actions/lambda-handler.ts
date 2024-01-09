import { type APIGatewayEvent } from "aws-lambda";
import { AnyZodObject, z } from "zod";
import { response } from "@/libs/handler";

type LambdaConfig<T extends AnyZodObject, TReturn> = {
  schema: T;
  event: APIGatewayEvent;
  lambda: (data: z.infer<T>) => Promise<TReturn>;
};

export const handleEvent = async <T extends AnyZodObject, TReturn>({
  event,
  schema,
  lambda,
}: LambdaConfig<T, TReturn>) => {
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
};
