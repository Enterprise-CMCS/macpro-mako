import { z } from "zod";

const baseIssueSchema = {
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  type: z.enum(["look", "functionality", "other"], {
    required_error: "type is required",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "priority is required",
  }),
  resolved: z.boolean().default(false),
};

export const issueSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  ...baseIssueSchema,
});

export type Issue = z.infer<typeof issueSchema>;
export const validateIssue = issueSchema.parse;

//////////////////////

export const createIssueSchema = z.object({
  ...baseIssueSchema,
});

export type CreateIssue = z.infer<typeof createIssueSchema>;
export const validateCreateIssue = createIssueSchema.parse;

///////////////////////

export const listIssueSchema = issueSchema.array();

export type IssueList = [z.infer<typeof listIssueSchema>];
export const validateListIssues = listIssueSchema.parse;
