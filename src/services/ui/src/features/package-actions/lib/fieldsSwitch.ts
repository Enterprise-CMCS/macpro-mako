import { Action, Authority, AuthorityUnion } from "shared-types";
import { ReactElement } from "react";
import {
  bWaiverRaiFields,
  chipSpaRaiFields,
  chipWithdrawPackageFields,
  defaultCompleteIntakeFields,
  defaultDisableRaiWithdrawFields,
  defaultEnableRaiWithdrawFields,
  defaultIssueRaiFields,
  defaultTempExtFields,
  defaultUpdateIdFields,
  defaultWithdrawPackageFields,
  defaultWithdrawRaiFields,
  medSpaRaiFields,
} from "@/features/package-actions/lib/modules";

type FieldsGroup = Record<AuthorityUnion, ReactElement[] | undefined>;

const issueRaiFor: FieldsGroup = {
  "CHIP SPA": defaultIssueRaiFields, // chip-spa-rai-attachments -> chip-rai-attachments
  "Medicaid SPA": defaultIssueRaiFields, // medicaid-spa-rai-attachments -> medicaid-rai-attachments
  "1915(b)": defaultIssueRaiFields, // waiverb-rai-attachments -> 1915(b)-rai-attachments
  "1915(c)": defaultIssueRaiFields, // waiverb-rai-attachments -> 1915(c)-rai-attachments
};

const respondToRaiFor: FieldsGroup = {
  "CHIP SPA": chipSpaRaiFields,
  "Medicaid SPA": medSpaRaiFields,
  "1915(b)": bWaiverRaiFields,
  "1915(c)": undefined,
};

const enableRaiWithdrawFor: FieldsGroup = {
  "CHIP SPA": defaultEnableRaiWithdrawFields,
  "Medicaid SPA": defaultEnableRaiWithdrawFields,
  "1915(b)": defaultEnableRaiWithdrawFields,
  "1915(c)": defaultEnableRaiWithdrawFields,
};

const disableRaiWithdrawFor: FieldsGroup = {
  "CHIP SPA": defaultDisableRaiWithdrawFields,
  "Medicaid SPA": defaultDisableRaiWithdrawFields,
  "1915(b)": defaultDisableRaiWithdrawFields,
  "1915(c)": defaultDisableRaiWithdrawFields,
};

const withdrawRaiFor: FieldsGroup = {
  "CHIP SPA": defaultWithdrawRaiFields,
  "Medicaid SPA": defaultWithdrawRaiFields,
  "1915(b)": defaultWithdrawRaiFields,
  "1915(c)": defaultWithdrawRaiFields,
};

const withdrawPackageFor: FieldsGroup = {
  "CHIP SPA": chipWithdrawPackageFields,
  "Medicaid SPA": defaultWithdrawPackageFields,
  "1915(b)": defaultWithdrawPackageFields,
  "1915(c)": defaultWithdrawPackageFields,
};

const tempExtensionFor: FieldsGroup = {
  "CHIP SPA": defaultTempExtFields,
  "Medicaid SPA": defaultTempExtFields,
  "1915(b)": defaultTempExtFields,
  "1915(c)": defaultTempExtFields,
};

const updateIdFor: FieldsGroup = {
  "CHIP SPA": defaultUpdateIdFields,
  "Medicaid SPA": defaultUpdateIdFields,
  "1915(b)": defaultUpdateIdFields,
  "1915(c)": defaultUpdateIdFields,
};

const completeIntakeFor: FieldsGroup = {
  "CHIP SPA": defaultCompleteIntakeFields,
  "Medicaid SPA": defaultCompleteIntakeFields,
  "1915(b)": defaultCompleteIntakeFields,
  "1915(c)": defaultCompleteIntakeFields,
};

export const getFieldsFor = (a: Action, p: AuthorityUnion): ReactElement[] => {
  const fieldsGroupMap: Record<string, FieldsGroup> = {
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
  const group = fieldsGroupMap?.[a];
  if (group === undefined) throw new Error(`No attachments group for "${a}"`);
  const fields = group[p];
  if (fields === undefined)
    throw new Error(`No fields for "${p}" found in group "${a}`);
  return fields;
};
