import { z } from "zod";

// This endpoint serves package searches, not arbitrary OpenSearch indices.
export const searchIndexSchema = z.enum(["main", "changelog"]);

const packageFields = new Set([
  "id",
  "packageId",
  "state",
  "authority",
  "actionType",
  "cmsStatus",
  "stateStatus",
  "seatoolStatus",
  "leadAnalystName",
  "submitterName",
  "submissionDate",
  "finalDispositionDate",
  "makoChangedDate",
  "raiReceivedDate",
  "raiRequestedDate",
  "raiWithdrawEnabled",
  "appkParentId",
  "origin",
  "timestamp",
  "event",
]);
const fieldSchema = z
  .string()
  .refine((field) => packageFields.has(field.replace(/\.keyword$/, "")));
const scalarSchema = z.union([z.string(), z.number().finite(), z.boolean()]);
const orderSchema = z.enum(["asc", "desc"]);

const fieldValueSchema = <T extends z.ZodTypeAny>(value: T) =>
  z.record(fieldSchema, value).refine((fields) => Object.keys(fields).length === 1);

const wildcardSchema = z
  .object({
    wildcard: fieldValueSchema(
      z.object({ value: z.string(), case_insensitive: z.boolean().optional() }).strict(),
    ),
  })
  .strict();

// Accept the exact clause shapes produced by the UI. In particular, terms lookups,
// scripts, and additional options nested inside otherwise allowed clauses are rejected.
const clauseSchema = z.union([
  z.object({ match_all: z.object({}).strict() }).strict(),
  z.object({ term: fieldValueSchema(scalarSchema) }).strict(),
  z.object({ terms: fieldValueSchema(z.array(scalarSchema).max(1000)) }).strict(),
  z.object({ match: fieldValueSchema(scalarSchema) }).strict(),
  z
    .object({
      range: fieldValueSchema(
        z
          .object({
            gte: z.union([z.string(), z.number().finite()]).optional(),
            lte: z.union([z.string(), z.number().finite()]).optional(),
          })
          .strict(),
      ),
    })
    .strict(),
  z.object({ exists: z.object({ field: fieldSchema }).strict() }).strict(),
  wildcardSchema,
  z
    .object({
      dis_max: z
        .object({
          queries: z.array(wildcardSchema).min(1).max(100),
          tie_breaker: z.number().finite().optional(),
          boost: z.number().finite().optional(),
        })
        .strict(),
    })
    .strict(),
]);

const boolSchema = z
  .object({
    must: z.array(clauseSchema).max(100).optional(),
    must_not: z.array(clauseSchema).max(100).optional(),
    should: z.array(clauseSchema).max(100).optional(),
    filter: z.array(clauseSchema).max(100).optional(),
  })
  .strict();

const aggregationSchema = z
  .object({
    terms: z
      .object({
        field: z.enum([
          "state.keyword",
          "authority.keyword",
          "actionType.keyword",
          "cmsStatus.keyword",
          "stateStatus.keyword",
          "leadAnalystName.keyword",
        ]),
        size: z.number().int().min(1).max(1000).optional(),
        order: z.object({ _term: orderSchema }).strict().optional(),
      })
      .strict(),
  })
  .strict();

export const searchRequestSchema = z
  .object({
    query: z.union([z.object({ bool: boolSchema }).strict(), clauseSchema]).optional(),
    from: z.number().int().min(0).max(10000).optional(),
    size: z.number().int().min(0).max(1000).optional(),
    sort: z.array(fieldValueSchema(orderSchema)).max(10).optional(),
    aggs: z
      .record(z.string().min(1).max(100), aggregationSchema)
      .refine((aggs) => Object.keys(aggs).length <= 10)
      .optional(),
    track_total_hits: z.boolean().optional(),
    includeDrafts: z.boolean().optional(),
  })
  .strict()
  .refine((request) => (request.from ?? 0) + (request.size ?? 100) <= 10000);
