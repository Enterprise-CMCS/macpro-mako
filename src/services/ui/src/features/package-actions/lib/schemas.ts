import { Action, Authority } from "shared-types";
import { ZodEffects, ZodObject } from "zod";
import { defaultIssueRaiSchema } from "./modules/issue-rai";
import { chipSpaRaiSchema, medSpaRaiSchema } from "./modules/respond-to-rai";
import { defaultWithdrawRaiSchema } from "./modules/withdraw-rai";
import {
  chipWithdrawPackageSchema,
  medWithdrawPackageSchema,
} from "./modules/withdraw-package";

type Schema = ZodObject<any> | ZodEffects<any>;
type SchemaMap = Record<Authority, Schema | undefined>;

const issueRaiFor: SchemaMap = {
  "chip spa": defaultIssueRaiSchema,
  "medicaid spa": defaultIssueRaiSchema,
  "1915(b)": defaultIssueRaiSchema,
  "1915(c)": defaultIssueRaiSchema,
  waiver: defaultIssueRaiSchema,
};

const respondToRaiFor: SchemaMap = {
  "chip spa": chipSpaRaiSchema,
  "medicaid spa": medSpaRaiSchema,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const withdrawRaiFor: SchemaMap = {
  "chip spa": defaultWithdrawRaiSchema,
  "medicaid spa": defaultWithdrawRaiSchema,
  "1915(b)": defaultWithdrawRaiSchema,
  "1915(c)": defaultWithdrawRaiSchema,
  waiver: defaultWithdrawRaiSchema,
};

const withdrawPackageFor: SchemaMap = {
  "chip spa": chipWithdrawPackageSchema,
  "medicaid spa": medWithdrawPackageSchema,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const tempExtensionFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const updateIdFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const completeIntakeFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

export const getSchemaFor = (a: Action, p: Authority): Schema | undefined => {
  const actionSchemaMap: Record<string, SchemaMap> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  return actionSchemaMap?.[a][p] || undefined;
};
