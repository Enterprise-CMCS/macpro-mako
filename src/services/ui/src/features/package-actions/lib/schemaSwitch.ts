import { Action, Authority } from "shared-types";
import { ZodEffects, ZodObject } from "zod";
import {
  bWaiverRaiSchema,
  chipSpaRaiSchema,
  chipWithdrawPackageSchema,
  defaultDisableRaiWithdrawSchema,
  defaultEnableRaiWithdrawSchema,
  defaultIssueRaiSchema,
  defaultTempExtSchema,
  defaultWithdrawPackageSchema,
  defaultWithdrawRaiSchema,
  medSpaRaiSchema,
  defaultCompleteIntakeSchema,
  defaultUpdateIdSchema,
} from "@/features/package-actions/lib/modules";

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

const enableRaiWithdrawFor: SchemaGroup = {
  "chip spa": defaultEnableRaiWithdrawSchema,
  "medicaid spa": defaultEnableRaiWithdrawSchema,
  "1915(b)": defaultEnableRaiWithdrawSchema,
  "1915(c)": defaultEnableRaiWithdrawSchema,
};

const disableRaiWithdrawFor: SchemaGroup = {
  "chip spa": defaultDisableRaiWithdrawSchema,
  "medicaid spa": defaultDisableRaiWithdrawSchema,
  "1915(b)": defaultDisableRaiWithdrawSchema,
  "1915(c)": defaultDisableRaiWithdrawSchema,
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
  "chip spa": defaultTempExtSchema,
  "medicaid spa": defaultTempExtSchema,
  "1915(b)": defaultTempExtSchema,
  "1915(c)": defaultTempExtSchema,
};

const updateIdFor: SchemaGroup = {
  "chip spa": defaultUpdateIdSchema,
  "medicaid spa": defaultUpdateIdSchema,
  "1915(b)": defaultUpdateIdSchema,
  "1915(c)": defaultUpdateIdSchema,
};

const completeIntakeFor: SchemaGroup = {
  "chip spa": defaultCompleteIntakeSchema,
  "medicaid spa": defaultCompleteIntakeSchema,
  "1915(b)": defaultCompleteIntakeSchema,
  "1915(c)": defaultCompleteIntakeSchema,
};

export const getSchemaFor = (a: Action, p: Authority): Schema => {
  const actionSchemaMap: Record<string, SchemaGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "enable-rai-withdraw": enableRaiWithdrawFor,
    "disable-rai-withdraw": disableRaiWithdrawFor,
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
