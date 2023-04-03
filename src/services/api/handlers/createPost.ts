import type { APIGatewayEvent } from "aws-lambda";
import { response } from "../libs/handler";
import { createPostSchema, post, postSchema } from "../models/Post";
import { PostService } from "../services/postService";

export const createPost = async (event: APIGatewayEvent) => {
  try {
    const validPost = createPostSchema.parse(JSON.parse(event.body));

    const newPost = await new PostService(post).createPost(validPost);

    return response({
      statusCode: 201,
      body: newPost,
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = createPost;
