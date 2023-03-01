import { handler as h } from "../libs/handler";
import { Post } from "../types/Post";

export const updatePost = async ({ pathParameters, body }) => {
  try {
    const { id } = pathParameters;

    if (!body || Object.keys(body).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request" }),
      };
    }

    // await updatePostById(id, post);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Post with ${id} was updated` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

export const handler = h(updatePost);
