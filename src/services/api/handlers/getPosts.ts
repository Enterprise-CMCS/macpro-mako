import { handler as h, withCors } from "../libs/handler";

export const getPosts = async () => {
  try {
    return withCors({
      statusCode: 200,
      body: JSON.stringify([]),
    });
  } catch (error) {
    return withCors({
      statusCode: 404,
      body: JSON.stringify({ message: "Posts not found" }),
    });
  }
};

export const handler = h(getPosts);
