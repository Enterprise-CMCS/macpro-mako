import { z } from "zod";

const postSchema = z.object({
  postId: z.string().uuid(),
  title: z.string(),
  post: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createPostSchema = z.object({
  title: z.string(),
  post: z.string(),
});

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;

export const validatePost = postSchema.parse;
export const validatePosts = z.array(postSchema).parse;
export const validateCreatePost = createPostSchema.parse;
