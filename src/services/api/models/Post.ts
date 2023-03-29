import { Item } from "dynamoose/dist/Item";
import * as dynamoose from "dynamoose";
import { z } from "zod";

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  post: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const validEnvVar = z.string();
const tableName = validEnvVar.parse("om-database-api-db-posts");

export type Post = z.infer<typeof postSchema>;

export type PostModel = Post & Item;

export const post = dynamoose.model<PostModel>(
  tableName,
  new dynamoose.Schema(
    {
      id: String,
      title: String,
      post: String,
      createdAt: Date,
      updatedAt: Date,
    },
    { timestamps: true }
  ),
  {
    create: false,
  }
);
