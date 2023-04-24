import { response } from "../libs/handler";
import { Post } from "../types/Post";

export const updatePost = async ({ pathParameters, body }) => {
  try {
    const { id } = pathParameters;

    if (!body || Object.keys(body).length === 0) {
      return response({
        statusCode: 400,
        body: { message: "Invalid request" },
      });
    }

    // await updatePostById(id, post);

    return response({
      statusCode: 200,
      body: { message: `Post with ${id} was updated` },
    });
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = updatePost;
