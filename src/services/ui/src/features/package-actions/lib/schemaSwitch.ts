import { Action, AuthorityUnion } from "shared-types";
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
type SchemaGroup = Record<AuthorityUnion, Schema | undefined>;

const issueRaiFor: SchemaGroup = {
  "CHIP SPA": defaultIssueRaiSchema,
  "Medicaid SPA": defaultIssueRaiSchema,
  "1915(b)": defaultIssueRaiSchema,
  "1915(c)": defaultIssueRaiSchema,
};

const respondToRaiFor: SchemaGroup = {
  "CHIP SPA": chipSpaRaiSchema,
  "Medicaid SPA": medSpaRaiSchema,
  "1915(b)": bWaiverRaiSchema,
  "1915(c)": bWaiverRaiSchema,
};

const enableRaiWithdrawFor: SchemaGroup = {
  "CHIP SPA": defaultEnableRaiWithdrawSchema,
  "Medicaid SPA": defaultEnableRaiWithdrawSchema,
  "1915(b)": defaultEnableRaiWithdrawSchema,
  "1915(c)": defaultEnableRaiWithdrawSchema,
};

const disableRaiWithdrawFor: SchemaGroup = {
  "CHIP SPA": defaultDisableRaiWithdrawSchema,
  "Medicaid SPA": defaultDisableRaiWithdrawSchema,
  "1915(b)": defaultDisableRaiWithdrawSchema,
  "1915(c)": defaultDisableRaiWithdrawSchema,
};

const withdrawRaiFor: SchemaGroup = {
  "CHIP SPA": defaultWithdrawRaiSchema,
  "Medicaid SPA": defaultWithdrawRaiSchema,
  "1915(b)": defaultWithdrawRaiSchema,
  "1915(c)": defaultWithdrawRaiSchema,
};

const withdrawPackageFor: SchemaGroup = {
  "CHIP SPA": chipWithdrawPackageSchema,
  "Medicaid SPA": defaultWithdrawPackageSchema,
  "1915(b)": defaultWithdrawPackageSchema,
  "1915(c)": defaultWithdrawPackageSchema,
};

const tempExtensionFor: SchemaGroup = {
  "CHIP SPA": defaultTempExtSchema,
  "Medicaid SPA": defaultTempExtSchema,
  "1915(b)": defaultTempExtSchema,
  "1915(c)": defaultTempExtSchema,
};

const updateIdFor: SchemaGroup = {
  "CHIP SPA": defaultUpdateIdSchema,
  "Medicaid SPA": defaultUpdateIdSchema,
  "1915(b)": defaultUpdateIdSchema,
  "1915(c)": defaultUpdateIdSchema,
};

const completeIntakeFor: SchemaGroup = {
  "CHIP SPA": defaultCompleteIntakeSchema,
  "Medicaid SPA": defaultCompleteIntakeSchema,
  "1915(b)": defaultCompleteIntakeSchema,
  "1915(c)": defaultCompleteIntakeSchema,
};

export const getSchemaFor = (a: Action, p: AuthorityUnion): Schema => {
  const actionSchemaMap: Record<string, SchemaGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "enable-rai-withdraw": enableRaiWithdrawFor,
    "disable-rai-withdraw": disableRaiWithdrawFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    //
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
