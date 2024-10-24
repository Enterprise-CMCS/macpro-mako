import { Action, AuthorityUnion } from "shared-types";
import { ZodEffects, ZodObject, ZodRawShape, ZodType } from "zod";
import {
  bWaiverRaiSchema,
  chipSpaRaiSchema,
  chipWithdrawPackageSchema,
  defaultTempExtSchema,
  defaultWithdrawPackageSchema,
  defaultWithdrawRaiSchema,
  medSpaRaiSchema,
  defaultUpdateIdSchema,
} from "@/features/package-actions/lib/modules";

type Schema = ZodObject<ZodRawShape> | ZodEffects<ZodType>;
type SchemaGroup = Record<AuthorityUnion, Schema | undefined | null>;

const respondToRaiFor: SchemaGroup = {
  "CHIP SPA": chipSpaRaiSchema,
  "Medicaid SPA": medSpaRaiSchema,
  "1915(b)": bWaiverRaiSchema,
  "1915(c)": bWaiverRaiSchema,
};

const enableRaiWithdrawFor: SchemaGroup = {
  "CHIP SPA": null,
  "Medicaid SPA": null,
  "1915(b)": null,
  "1915(c)": null,
};

const disableRaiWithdrawFor: SchemaGroup = {
  "CHIP SPA": null,
  "Medicaid SPA": null,
  "1915(b)": null,
  "1915(c)": null,
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

export const getSchemaFor = (a: Action, p: AuthorityUnion): Schema | null => {
  const actionSchemaMap: Record<string, SchemaGroup> = {
    "respond-to-rai": respondToRaiFor,
    "enable-rai-withdraw": enableRaiWithdrawFor,
    "disable-rai-withdraw": disableRaiWithdrawFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
  };

  const group = actionSchemaMap[a];
  if (group === undefined) {
    throw new Error(`No schema group for "${a}"`);
  }

  const schema = group[p];
  if (schema === undefined) {
    throw new Error(`No schema for "${p}" found in group "${a}`);
  }

  return schema;
};
