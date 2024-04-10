import { Action, Authority } from "shared-types";
import { AttachmentRecipe } from "@/utils";
import { defaultIssueRaiAttachments } from "./modules/issue-rai";
import {
  chipSpaRaiAttachments,
  medSpaRaiAttachments,
} from "./modules/respond-to-rai";
import {
  chipWithdrawPackageAttachments,
  medWithdrawPackageAttachments,
} from "./modules/withdraw-package";

type AttachmentsGroup = Record<Authority, AttachmentRecipe<any>[] | undefined>;

const issueRaiFor: AttachmentsGroup = {
  "chip spa": defaultIssueRaiAttachments,
  "medicaid spa": defaultIssueRaiAttachments,
  "1915(b)": defaultIssueRaiAttachments,
  "1915(c)": defaultIssueRaiAttachments,
  waiver: defaultIssueRaiAttachments,
};

const respondToRaiFor: AttachmentsGroup = {
  "chip spa": chipSpaRaiAttachments,
  "medicaid spa": medSpaRaiAttachments,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const withdrawRaiFor: AttachmentsGroup = {
  "chip spa": defaultIssueRaiAttachments,
  "medicaid spa": defaultIssueRaiAttachments,
  "1915(b)": defaultIssueRaiAttachments,
  "1915(c)": defaultIssueRaiAttachments,
  waiver: defaultIssueRaiAttachments,
};

const withdrawPackageFor: AttachmentsGroup = {
  "chip spa": chipWithdrawPackageAttachments,
  "medicaid spa": medWithdrawPackageAttachments,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const tempExtensionFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const updateIdFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

const completeIntakeFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
  waiver: undefined,
};

export const getAttachmentsFor = (
  a: Action,
  p: Authority,
): AttachmentRecipe<any>[] | undefined => {
  const attachmentsMap: Record<string, AttachmentsGroup> = {
    "issue-rai": issueRaiFor,
    "respond-to-rai": respondToRaiFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
    "complete-intake": completeIntakeFor,
  };
  return attachmentsMap?.[a][p] || undefined;
};
