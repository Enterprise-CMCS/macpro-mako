import { response } from "../libs/handler";
import { post } from "../models/Post";
import { PostService } from "../services/postService";

type ExamplePostType = {
  id: string;
  description: string;
};

export const getPosts = async () => {
  try {
    const posts = await new PostService(post).getPosts();

    return response({
      statusCode: 200,
      body: posts,
    });
  } catch (error) {
    console.log(error);
    return response({
      statusCode: 404,
      body: { message: "Posts not found" },
    });
  }
};

export const handler = getPosts;
