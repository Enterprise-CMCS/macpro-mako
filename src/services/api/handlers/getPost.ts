import { handler as h } from "../libs/handler";

export const getPost = async ({ pathParameters }) => {
  try {
    const { id } = pathParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ post: { id, title: "My first post" } }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Post not found" }),
    };
  }
};

export const handler = h(getPost);
