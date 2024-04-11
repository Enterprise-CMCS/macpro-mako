import { ReactNode } from "react";
import { BannerContent } from "@/components";
import { Action, Authority } from "shared-types";

export type FormContent = {
  title: string;
  description: ReactNode;
  preSubmitNotice: string;
  successBanner: BannerContent;
  additionalInfoInstruction?: string;
  attachmentsInstruction?: string;
};
type FormContentGroup = Record<Authority, FormContent | undefined>;

const issueRaiFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const respondToRaiFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const withdrawRaiFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const withdrawPackageFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const tempExtensionFor: FormContentGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
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

export const getContentFor = (
  a: Action,
  p: Authority,
): FormContent | undefined => {
  const actionContentMap: Record<string, FormContentGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  return actionContentMap?.[a][p] || undefined;
};
