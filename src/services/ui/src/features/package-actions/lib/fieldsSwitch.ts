import { Action, Authority } from "shared-types";
import { ReactElement } from "react";
import { defaultIssueRaiFields } from "@/features/package-actions/lib/modules/issue-rai";
import {
  bWaiverRaiFields,
  chipSpaRaiFields,
  medSpaRaiFields,
} from "@/features/package-actions/lib/modules/respond-to-rai";

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
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const withdrawPackageFor: FieldsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const tempExtensionFor: FieldsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
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
