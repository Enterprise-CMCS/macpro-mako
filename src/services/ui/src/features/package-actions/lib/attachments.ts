import { Action, Authority } from "shared-types";
import { AttachmentRecipe } from "@/utils";
import { defaultIssueRaiAttachments } from "./modules/issue-rai";
import {
  bWaiverRaiAttachments,
  chipSpaRaiAttachments,
  medSpaRaiAttachments,
} from "./modules/respond-to-rai";
import {
  chipWithdrawPackageAttachments,
  defaultWithdrawPackageAttachments,
} from "./modules/withdraw-package";
import { defaultWithdrawRaiAttachments } from "@/features/package-actions/lib/modules/withdraw-rai";

type AttachmentsGroup = Record<Authority, AttachmentRecipe<any>[] | undefined>;

const issueRaiFor: AttachmentsGroup = {
  "chip spa": defaultIssueRaiAttachments,
  "medicaid spa": defaultIssueRaiAttachments,
  "1915(b)": defaultIssueRaiAttachments,
  "1915(c)": defaultIssueRaiAttachments,
};

const respondToRaiFor: AttachmentsGroup = {
  "chip spa": chipSpaRaiAttachments,
  "medicaid spa": medSpaRaiAttachments,
  "1915(b)": bWaiverRaiAttachments,
  "1915(c)": bWaiverRaiAttachments,
};

const withdrawRaiFor: AttachmentsGroup = {
  "chip spa": defaultWithdrawRaiAttachments,
  "medicaid spa": defaultWithdrawRaiAttachments,
  "1915(b)": defaultWithdrawRaiAttachments,
  "1915(c)": defaultWithdrawRaiAttachments,
};

const withdrawPackageFor: AttachmentsGroup = {
  "chip spa": chipWithdrawPackageAttachments,
  "medicaid spa": defaultWithdrawPackageAttachments,
  "1915(b)": defaultWithdrawPackageAttachments,
  "1915(c)": defaultWithdrawPackageAttachments,
};

const tempExtensionFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const updateIdFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
};

const completeIntakeFor: AttachmentsGroup = {
  "chip spa": undefined,
  "medicaid spa": undefined,
  "1915(b)": undefined,
  "1915(c)": undefined,
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
