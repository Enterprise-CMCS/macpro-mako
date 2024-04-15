import { Action, Authority } from "shared-types";
import { ReactElement } from "react";
import {
  bWaiverRaiFields,
  chipSpaRaiFields,
  chipWithdrawPackageFields,
  defaultIssueRaiFields,
  defaultTempExtFields,
  defaultWithdrawPackageFields,
  defaultWithdrawRaiFields,
  medSpaRaiFields,
} from "@/features/package-actions/lib/modules";

type FieldsGroup = Record<Authority, ReactElement[] | undefined>;

const issueRaiFor: FieldsGroup = {
  "chip spa": defaultIssueRaiFields,
  "medicaid spa": defaultIssueRaiFields,
  "1915(b)": defaultIssueRaiFields,
  "1915(c)": defaultIssueRaiFields,
};

const respondToRaiFor: FieldsGroup = {
  "chip spa": chipSpaRaiFields,
  "medicaid spa": medSpaRaiFields,
  "1915(b)": bWaiverRaiFields,
  "1915(c)": undefined,
};

const withdrawRaiFor: FieldsGroup = {
  "chip spa": defaultWithdrawRaiFields,
  "medicaid spa": defaultWithdrawRaiFields,
  "1915(b)": defaultWithdrawRaiFields,
  "1915(c)": defaultWithdrawRaiFields,
};

const withdrawPackageFor: FieldsGroup = {
  "chip spa": chipWithdrawPackageFields,
  "medicaid spa": defaultWithdrawPackageFields,
  "1915(b)": defaultWithdrawPackageFields,
  "1915(c)": defaultWithdrawPackageFields,
};

const tempExtensionFor: FieldsGroup = {
  "chip spa": defaultTempExtFields,
  "medicaid spa": defaultTempExtFields,
  "1915(b)": defaultTempExtFields,
  "1915(c)": defaultTempExtFields,
};

const updateIdFor: FieldsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const completeIntakeFor: FieldsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

export const getFieldsFor = (a: Action, p: Authority): ReactElement[] => {
  const fieldsGroupMap: Record<string, FieldsGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  const group = fieldsGroupMap?.[a];
  if (group === undefined) throw new Error(`No attachments group for "${a}"`);
  const fields = group[p];
  if (fields === undefined)
    throw new Error(`No fields for "${p}" found in group "${a}`);
  return fields;
};
