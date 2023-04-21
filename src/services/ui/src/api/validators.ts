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

export const issueSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  type: z
    .string()
    .refine((val) => ["look", "functionality", "other"].includes(val), {
      message: 'Type must be one of "look", "functionality", or "other"',
    }),
  priority: z
    .string()
    .refine((val) => ["low", "medium", "high"].includes(val), {
      message: 'Priority must be one of "low", "medium", or "high"',
    }),
  resolved: z.boolean().default(false),
});

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type IssueSchema = z.infer<typeof issueSchema>;

export const validatePost = postSchema.parse;
export const validatePosts = z.array(postSchema).parse;
export const validateCreatePost = createPostSchema.parse;
export const validateIssue = issueSchema.parse;
