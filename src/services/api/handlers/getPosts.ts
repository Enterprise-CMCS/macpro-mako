import { handler as h } from "../libs/handler";

export const getPosts = async () => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Posts not found" }),
    };
  }
};

export const handler = await h(getPosts);
