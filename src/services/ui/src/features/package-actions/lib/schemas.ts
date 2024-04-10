import { Action, Authority } from "shared-types";
import { ZodObject } from "zod";

type SchemaMap = Record<Authority, ZodObject<any> | undefined>;

const issueRaiFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const respondToRaiFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const withdrawRaiFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const withdrawPackageFor: SchemaMap = {
  "chip spa": undefined,
  "medicaid spa": undefined,
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

export const getSchemaFor = (
  a: Action,
  p: Authority,
): ZodObject<any> | undefined => {
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
