import { response } from "../libs/handler";

export const getPost = async ({ pathParameters }) => {
  try {
    const { id } = pathParameters;

    if (!id) {
      return response({
        statusCode: 400,
        body: { message: "Invalid request" },
      });
    }

    return response({
      statusCode: 200,
      body: { post: { id, title: "My first post" } },
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: "Post not found" },
    });
  }
};

export const handler = getPost;
