import { z } from "zod";

export const createIssueSchema = z.object({
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

export type CreateIssueSchema = z.infer<typeof createIssueSchema>;
export const validateCreateIssue = createIssueSchema.parse;

////////////////////

export const getIssueSchema = z.object({
  id: z.string().min(1),
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

export type GetIssueSchema = z.infer<typeof getIssueSchema>;
export const validateGetIssue = getIssueSchema.parse;

///////////////////////

export const listIssueSchema = z
  .object({
    id: z.string().min(1),
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
  })
  .array();

export type IssueListSchema = [z.infer<typeof listIssueSchema>];
export const validateListIssues = listIssueSchema.parse;
