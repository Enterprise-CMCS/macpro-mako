import { Banner, UserPrompt } from "@/components";
import { Action, AuthorityUnion, opensearch } from "shared-types";
import {
  defaultTempExtContent,
  defaultWithdrawPackageContent,
  defaultWithdrawRaiContent,
  spaRaiContent,
  waiverRaiContent,
  defaultDisableRaiWithdrawContent,
  defaultEnableRaiWithdrawContent,
  defaultUpdateIdContent,
  waiverWithdrawPackageContent,
} from "@/features/package-actions/lib/modules";

type FormContent = {
  title: string;
  successBanner: Omit<Banner, "variant" | "pathnameToDisplayOn">;
  preSubmitNotice?: string;
  confirmationModal?: Omit<UserPrompt, "onAccept">;
  enableSubmit?: boolean;
};
/** Form content sometimes requires data values for templating, so forms
 * hydrate the content with these functions. */
export type FormContentHydrator = (d: opensearch.main.Document) => FormContent;
type FormContentGroup = Record<AuthorityUnion, FormContentHydrator | undefined>;

const respondToRaiFor: FormContentGroup = {
  "CHIP SPA": spaRaiContent,
  "Medicaid SPA": spaRaiContent,
  "1915(b)": waiverRaiContent,
  "1915(c)": waiverRaiContent,
};

const enableRaiWithdrawFor: FormContentGroup = {
  "CHIP SPA": defaultEnableRaiWithdrawContent,
  "Medicaid SPA": defaultEnableRaiWithdrawContent,
  "1915(b)": defaultEnableRaiWithdrawContent,
  "1915(c)": defaultEnableRaiWithdrawContent,
};

const disableRaiWithdrawFor: FormContentGroup = {
  "CHIP SPA": defaultDisableRaiWithdrawContent,
  "Medicaid SPA": defaultDisableRaiWithdrawContent,
  "1915(b)": defaultDisableRaiWithdrawContent,
  "1915(c)": defaultDisableRaiWithdrawContent,
};

const withdrawRaiFor: FormContentGroup = {
  "CHIP SPA": defaultWithdrawRaiContent,
  "Medicaid SPA": defaultWithdrawRaiContent,
  "1915(b)": defaultWithdrawRaiContent,
  "1915(c)": defaultWithdrawRaiContent,
};

const withdrawPackageFor: FormContentGroup = {
  "CHIP SPA": defaultWithdrawPackageContent,
  "Medicaid SPA": defaultWithdrawPackageContent,
  "1915(b)": waiverWithdrawPackageContent,
  "1915(c)": waiverWithdrawPackageContent,
};

const tempExtensionFor: FormContentGroup = {
  "CHIP SPA": defaultTempExtContent,
  "Medicaid SPA": defaultTempExtContent,
  "1915(b)": defaultTempExtContent,
  "1915(c)": defaultTempExtContent,
};

const updateIdFor: FormContentGroup = {
  "CHIP SPA": defaultUpdateIdContent,
  "Medicaid SPA": defaultUpdateIdContent,
  "1915(b)": defaultUpdateIdContent,
  "1915(c)": defaultUpdateIdContent,
};

export const getContentFor = (
  a: Action,
  p: AuthorityUnion,
): FormContentHydrator => {
  const actionContentMap: Record<string, FormContentGroup> = {
    "respond-to-rai": respondToRaiFor,
    "enable-rai-withdraw": enableRaiWithdrawFor,
    "disable-rai-withdraw": disableRaiWithdrawFor,
    "withdraw-rai": withdrawRaiFor,
    "withdraw-package": withdrawPackageFor,
    "temporary-extension": tempExtensionFor,
    "update-id": updateIdFor,
  };
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No content group for "${a}"`);
  const content = group[p];
  if (!content) throw new Error(`No content for "${p}" found in group "${a}`);
  return content;
};
