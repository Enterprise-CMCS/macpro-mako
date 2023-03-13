import { response } from "../libs/handler";

export const deletePost = async ({ pathParameters }) => {
  try {
    if (!pathParameters || !pathParameters.id) {
      return response({
        statusCode: 400,
        body: { message: "Invalid request" },
      });
    }

    const { id } = pathParameters;

    return response({
      statusCode: 200,
      body: { post: `Post with ${id} was deleted` },
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = deletePost;
