import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { defaultWithdrawPackageContent } from "@/features/package-actions/lib/modules";

export const appKWithdrawPackageContent: FormContentHydrator = (document) => ({
  ...defaultWithdrawPackageContent(document),
  confirmationModal: {
    header: "Are you sure you want to withdraw this package?",
    body: `You are about to withdraw ${document.authority} ${document.id}. Completing this action will conclude the review of this ${document.authority} package, and all packages associated with ${document.id} will also be withdrawn. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance`,
    acceptButtonText: "Yes, withdraw",
    cancelButtonText: "Cancel",
  },
});
