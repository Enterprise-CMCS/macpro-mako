import { z } from "zod";

// these are duplicate types that should be put somewhere else
export const issueSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  type: z
    .string()
    .refine((val) => ["look", "functionality", "other"].includes(val), {
      message: "Type must be one of \"look\", \"functionality\", or \"other\"",
    }),
  priority: z
    .string()
    .refine((val) => ["low", "medium", "high"].includes(val), {
      message: "Priority must be one of \"low\", \"medium\", or \"high\"",
    }),
  resolved: z.boolean().default(false),
  createdAt: z.string(),
});

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .refine((value) => value !== "error", {
      message: "Title cannot be \"error\"",
    }),
  description: z.string().min(1, { message: "Description is required" }),
  type: z
    .string()
    .refine((val) => ["look", "functionality", "other"].includes(val), {
      message: "Type must be one of \"look\", \"functionality\", or \"other\"",
    }),
  priority: z
    .string()
    .refine((val) => ["low", "medium", "high"].includes(val), {
      message: "Priority must be one of \"low\", \"medium\", or \"high\"",
    }),
  resolved: z.boolean().default(false),
});

export type Issue = z.infer<typeof issueSchema>;
export type CreateIssue = z.infer<typeof createIssueSchema>;
