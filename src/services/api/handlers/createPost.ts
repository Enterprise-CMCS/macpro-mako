import type { APIGatewayEvent } from "aws-lambda";
import { handler as h } from "../libs/handler";

export const createPost = async (event: APIGatewayEvent) => {
  try {
    return {
      statusCode: 201,
      body: JSON.stringify({ post: {} }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: error }),
    };
  }
};

export const handler = h(createPost);
