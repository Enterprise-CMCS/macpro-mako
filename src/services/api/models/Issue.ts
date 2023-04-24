import { Item } from "dynamoose/dist/Item";
import * as dynamoose from "dynamoose";
import { z } from "zod";

// these are duplicate types that should be put somewhere else
export const issueSchema = z.object({
  issueId: z.string().uuid(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
});

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

const validEnvVar = z.string();
const tableName = validEnvVar.parse(process.env.issuesTable);

export type Issue = z.infer<typeof issueSchema>;
export type CreateIssue = z.infer<typeof createIssueSchema>;

export type IssueModel = Issue & Item;

export const issue = dynamoose.model<IssueModel>(
  tableName,
  new dynamoose.Schema(
    {
      id: String,
      title: String,
      description: String,
    },
    { timestamps: true }
  ),
  {
    create: false,
  }
);
