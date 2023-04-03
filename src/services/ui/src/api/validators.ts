import { z } from "zod";

const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  post: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Post = z.infer<typeof postSchema>;

export const validatePost = postSchema.parse;
export const validatePosts = z.array(postSchema).parse;
