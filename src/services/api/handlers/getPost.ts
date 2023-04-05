import { z, ZodError } from "zod";
import { response } from "../libs/handler";
import { post } from "../models/Post";
import { PostService } from "../services/postService";

export const getPost = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    });

    const params = validParams.parse(pathParameters);

    // const foundPost = new PostService(post).getPost(params.id);

    return response({
      statusCode: 200,
      body: {},
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response({
        statusCode: 404,
        body: { message: error },
      });
    }
    return response({
      statusCode: 404,
      body: { message: "Post not found" },
    });
  }
};

export const handler = getPost;
