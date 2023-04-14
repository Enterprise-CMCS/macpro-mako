import { Item } from "dynamoose/dist/Item";
import * as dynamoose from "dynamoose";
import { z } from "zod";

export const postSchema = z.object({
  postId: z.string().uuid(),
  title: z.string(),
  post: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPostSchema = z.object({
  title: z.string(),
  post: z.string(),
});

const validEnvVar = z.string();
const tableName = validEnvVar.parse(process.env.postsTableName);

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;

export type PostModel = Post & Item;

export const post = dynamoose.model<PostModel>(
  tableName,
  new dynamoose.Schema(
    {
      postId: String,
      title: String,
      post: String,
    },
    { timestamps: true }
  ),
  {
    create: false,
  }
);
