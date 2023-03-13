import { response } from "../libs/handler";

type ExamplePostType = {
  id: string;
  description: string;
};

export const getPosts = async () => {
  try {
    return response<ExamplePostType[]>({
      statusCode: 200,
      body: [],
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: JSON.stringify({ message: "Posts not found" }),
    });
  }
};

export const handler = getPosts;
