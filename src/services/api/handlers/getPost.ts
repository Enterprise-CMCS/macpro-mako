import { z, ZodError } from "zod";
import { response } from "../libs/handler";
import { post } from "../models/Post";
import { PostService } from "../services/postService";

export const getPost = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    });

    console.log(validParams, "valid params");

    const params = validParams.parse(pathParameters);

    console.log(params, "params");

    const foundPost = await new PostService(post).getPost(params.id);

    console.log(foundPost, "found post");

    return response({
      statusCode: 200,
      body: foundPost,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response({
        statusCode: 404,
        body: { message: error },
      });
    }

    console.log(error);

    return response({
      statusCode: 404,
      body: { message: "Post not found" },
    });
  }
};

export const handler = getPost;
