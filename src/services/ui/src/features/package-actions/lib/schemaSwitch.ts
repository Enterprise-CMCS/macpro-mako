import { Action, Authority } from "shared-types";
import { ZodEffects, ZodObject } from "zod";
import { defaultIssueRaiSchema } from "./modules/issue-rai";
import {
  bWaiverRaiSchema,
  chipSpaRaiSchema,
  medSpaRaiSchema,
} from "./modules/respond-to-rai";
import { defaultWithdrawRaiSchema } from "./modules/withdraw-rai";
import {
  chipWithdrawPackageSchema,
  defaultWithdrawPackageSchema,
} from "./modules/withdraw-package";

type Schema = ZodObject<any> | ZodEffects<any>;
type SchemaGroup = Record<Authority, Schema | undefined>;

const issueRaiFor: SchemaGroup = {
  "chip spa": defaultIssueRaiSchema,
  "medicaid spa": defaultIssueRaiSchema,
  "1915(b)": defaultIssueRaiSchema,
  "1915(c)": defaultIssueRaiSchema,
};

const respondToRaiFor: SchemaGroup = {
  "chip spa": chipSpaRaiSchema,
  "medicaid spa": medSpaRaiSchema,
  "1915(b)": bWaiverRaiSchema,
  "1915(c)": bWaiverRaiSchema,
};

const withdrawRaiFor: SchemaGroup = {
  "chip spa": defaultWithdrawRaiSchema,
  "medicaid spa": defaultWithdrawRaiSchema,
  "1915(b)": defaultWithdrawRaiSchema,
  "1915(c)": defaultWithdrawRaiSchema,
};

const withdrawPackageFor: SchemaGroup = {
  "chip spa": chipWithdrawPackageSchema,
  "medicaid spa": defaultWithdrawPackageSchema,
  "1915(b)": defaultWithdrawPackageSchema,
  "1915(c)": defaultWithdrawPackageSchema,
};

const tempExtensionFor: SchemaGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const updateIdFor: SchemaGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const completeIntakeFor: SchemaGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

export const getSchemaFor = (a: Action, p: Authority): Schema => {
  const actionSchemaMap: Record<string, SchemaGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  const group = actionSchemaMap[a];
  if (!group) throw new Error(`No schema group for "${a}"`);
  const schema = group[p];
  if (!schema) throw new Error(`No schema for "${p}" found in group "${a}`);
  return schema;
};
