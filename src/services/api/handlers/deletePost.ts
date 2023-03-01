import { handler as h } from "../libs/handler";

export const deletePost = async ({ pathParameters }) => {
  try {
    if (!pathParameters || !pathParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request" }),
      };
    }

    const { id } = pathParameters;

    return {
      statusCode: 200,
      body: JSON.stringify({ post: `Post with ${id} was deleted` }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: error }),
    };
  }
};

export const handler = h(deletePost);
