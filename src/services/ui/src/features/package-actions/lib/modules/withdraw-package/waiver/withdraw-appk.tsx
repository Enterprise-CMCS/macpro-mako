import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { defaultWithdrawPackageContent } from "@/features/package-actions/lib/modules";

export const waiverWithdrawPackageContent: FormContentHydrator = (
  document,
) => ({
  ...defaultWithdrawPackageContent(document),
  confirmationModal: {
    ...defaultWithdrawPackageContent(document).confirmationModal!,
    body: `You are about to withdraw ${document.authority} waiver ${document.id}. Completing this action will conclude the review of this ${document.authority} waiver package, and all packages associated with ${document.id} will also be withdrawn. If you are not sure this is the correct action to select, contact your CMS point of contact for assistance`,
  },
});
