import { handler as h } from "../libs/handler";

export const handler = h(async ({ pathParameters }) => {
  const { id } = pathParameters;

  return {
    statusCode: 200,
    body: JSON.stringify({ post: { id, title: "My first post" } }),
  };
});
