import * as middy from "middy";
import { cors } from "middy/middlewares";

export const handler = middy(async () => {
  return {
    statusCode: 200,
  };
}).use(cors());
