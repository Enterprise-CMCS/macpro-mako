import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { defaultWithdrawPackageContent } from "@/features/package-actions/lib/modules";
import { opensearch } from "shared-types";

const confirmationModalBody = (document: opensearch.main.Document) => {
  const beginning = `You are about to withdraw ${document.authority} waiver ${document.id}.`;
  const middle = document.appkParent
    ? `Completing this action will conclude
    the review of this ${document.authority} waiver package, and all packages associated with ${document.id} will also be withdrawn.`
    : `Completing this action will conclude 
    the review of this ${document.authority} waiver package.`;
  const end =
    "If you are not sure this is the correct action to select, contact your CMS point of contact for assistance.";
  return `${beginning} ${middle} ${end}`;
};

export const waiverWithdrawPackageContent: FormContentHydrator = (
  document,
) => ({
  ...defaultWithdrawPackageContent(document),
  confirmationModal: {
    ...defaultWithdrawPackageContent(document).confirmationModal!,
    // The AppK condition got messy, so I broke the string templating logic out
    body: confirmationModalBody(document),
  },
});
