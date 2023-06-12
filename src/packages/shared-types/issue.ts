import { z } from "zod";

export const issueSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  type: z
    .enum(["look", "functionality", "other"]),
  // .refine((val) => ["look", "functionality", "other"].includes(val), {
  //   message: "Type must be one of \"look\", \"functionality\", or \"other\"",
  // }),
  priority: z
    .enum(["low", "medium", "high"]),
  // .refine((val) => ["low", "medium", "high"].includes(val), {
  //   message: "Priority must be one of \"low\", \"medium\", or \"high\"",
  // }),
  resolved: z.boolean().default(false),
  createdAt: z.number(),
});

export type Issue = z.infer<typeof issueSchema>;

//////////////////////

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

export type CreateIssue = z.infer<typeof createIssueSchema>;
export const validateCreateIssue = createIssueSchema.parse;

////////////////////

export const getIssueSchema = z.object({
  id: z.string().min(1),
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
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type GetIssue = z.infer<typeof getIssueSchema>;
export const validateGetIssue = getIssueSchema.parse;

///////////////////////

export const listIssueSchema = getIssueSchema.array();

export type IssueList = [z.infer<typeof listIssueSchema>];
export const validateListIssues = listIssueSchema.parse;

///////////////////////

export type UpdateIssue = z.infer<typeof getIssueSchema>;
export const validateUpdateIssue = getIssueSchema.parse;
