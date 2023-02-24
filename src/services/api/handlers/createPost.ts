import { handler as h } from "../libs/handler";

export const handler = h(async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ post: {} }),
  };
});
