import { ReactNode } from "react";
import { BannerContent, SubmissionAlert } from "@/components";
import { Action, Authority, opensearch } from "shared-types";
import {
  chipWithdrawPackageContent,
  defaultIssueRaiContent,
  defaultTempExtContent,
  defaultWithdrawPackageContent,
  defaultWithdrawRaiContent,
  spaRaiContent,
  waiverRaiContent,
} from "@/features/package-actions/lib/modules";

type FormContent = {
  title: string;
  description?: ReactNode;
  preSubmitNotice: string;
  successBanner: BannerContent;
  additionalInfoInstruction?: string;
  attachmentsInstruction?: string;
  confirmationModal?: SubmissionAlert;
};
/** Form content sometimes requires data values for templating, so forms
 * hydrate the content with these functions. */
export type FormContentHydrator = (d: opensearch.main.Document) => FormContent;
type FormContentGroup = Record<Authority, FormContentHydrator | undefined>;

const issueRaiFor: FormContentGroup = {
  "chip spa": defaultIssueRaiContent,
  "medicaid spa": defaultIssueRaiContent,
  "1915(b)": defaultIssueRaiContent,
  "1915(c)": defaultIssueRaiContent,
};

const respondToRaiFor: FormContentGroup = {
  "chip spa": spaRaiContent,
  "medicaid spa": spaRaiContent,
  "1915(b)": waiverRaiContent,
  "1915(c)": waiverRaiContent,
};

const withdrawRaiFor: FormContentGroup = {
  "chip spa": defaultWithdrawRaiContent,
  "medicaid spa": defaultWithdrawRaiContent,
  "1915(b)": defaultWithdrawRaiContent,
  "1915(c)": defaultWithdrawRaiContent,
};

const withdrawPackageFor: FormContentGroup = {
  "chip spa": chipWithdrawPackageContent,
  "medicaid spa": defaultWithdrawPackageContent,
  "1915(b)": defaultWithdrawPackageContent,
  "1915(c)": defaultWithdrawPackageContent,
};

const tempExtensionFor: FormContentGroup = {
  "chip spa": defaultTempExtContent,
  "medicaid spa": defaultTempExtContent,
  "1915(b)": defaultTempExtContent,
  "1915(c)": defaultTempExtContent,
};

const updateIdFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const completeIntakeFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

export const getContentFor = (a: Action, p: Authority): FormContentHydrator => {
  const actionContentMap: Record<string, FormContentGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No content group for "${a}"`);
  const content = group[p];
  if (!content) throw new Error(`No content for "${p}" found in group "${a}`);
  return content;
};
