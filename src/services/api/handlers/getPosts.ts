import { response } from "../libs/handler";

export const getPosts = async () => {
  try {
    return response({
      statusCode: 200,
      body: JSON.stringify([]),
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: JSON.stringify({ message: "Posts not found" }),
    });
  }
};

export const handler = getPosts;
