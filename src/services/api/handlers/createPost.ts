import type { APIGatewayEvent } from "aws-lambda";
import { response } from "../libs/handler";

export const createPost = async (event: APIGatewayEvent) => {
  try {
    return response({
      statusCode: 201,
      body: { post: {} },
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = createPost;
