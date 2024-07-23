import { BannerContent, SubmissionAlert } from "@/components";
import { Action, SeatoolAuthority, opensearch } from "shared-types";
import {
  defaultIssueRaiContent,
  defaultTempExtContent,
  defaultWithdrawPackageContent,
  defaultWithdrawRaiContent,
  spaRaiContent,
  waiverRaiContent,
  defaultDisableRaiWithdrawContent,
  defaultEnableRaiWithdrawContent,
  defaultCompleteIntakeContent,
  defaultUpdateIdContent,
  waiverWithdrawPackageContent,
} from "@/features/package-actions/lib/modules";

type FormContent = {
  title: string;
  successBanner: BannerContent;
  preSubmitNotice?: string;
  confirmationModal?: SubmissionAlert;
  enableSubmit?: boolean;
};
/** Form content sometimes requires data values for templating, so forms
 * hydrate the content with these functions. */
export type FormContentHydrator = (d: opensearch.main.Document) => FormContent;
type FormContentGroup = Partial<Record<SeatoolAuthority, FormContentHydrator>>;

const issueRaiFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultIssueRaiContent,
  [SeatoolAuthority.MedicaidSPA]: defaultIssueRaiContent,
  [SeatoolAuthority["1915b"]]: defaultIssueRaiContent,
  [SeatoolAuthority["1915c"]]: defaultIssueRaiContent,
};

const respondToRaiFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: spaRaiContent,
  [SeatoolAuthority.MedicaidSPA]: spaRaiContent,
  [SeatoolAuthority["1915b"]]: waiverRaiContent,
  [SeatoolAuthority["1915c"]]: waiverRaiContent,
};

const enableRaiWithdrawFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultEnableRaiWithdrawContent,
  [SeatoolAuthority.MedicaidSPA]: defaultEnableRaiWithdrawContent,
  [SeatoolAuthority["1915b"]]: defaultEnableRaiWithdrawContent,
  [SeatoolAuthority["1915c"]]: defaultEnableRaiWithdrawContent,
};

const disableRaiWithdrawFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultDisableRaiWithdrawContent,
  [SeatoolAuthority.MedicaidSPA]: defaultDisableRaiWithdrawContent,
  [SeatoolAuthority["1915b"]]: defaultDisableRaiWithdrawContent,
  [SeatoolAuthority["1915c"]]: defaultDisableRaiWithdrawContent,
};

const withdrawRaiFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultWithdrawRaiContent,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawRaiContent,
  [SeatoolAuthority["1915b"]]: defaultWithdrawRaiContent,
  [SeatoolAuthority["1915c"]]: defaultWithdrawRaiContent,
};

const withdrawPackageFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultWithdrawPackageContent,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawPackageContent,
  [SeatoolAuthority["1915b"]]: waiverWithdrawPackageContent,
  [SeatoolAuthority["1915c"]]: waiverWithdrawPackageContent,
};

const tempExtensionFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultTempExtContent,
  [SeatoolAuthority.MedicaidSPA]: defaultTempExtContent,
  [SeatoolAuthority["1915b"]]: defaultTempExtContent,
  [SeatoolAuthority["1915c"]]: defaultTempExtContent,
};

const updateIdFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultUpdateIdContent,
  [SeatoolAuthority.MedicaidSPA]: defaultUpdateIdContent,
  [SeatoolAuthority["1915b"]]: defaultUpdateIdContent,
  [SeatoolAuthority["1915c"]]: defaultUpdateIdContent,
};

const completeIntakeFor: FormContentGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultCompleteIntakeContent,
  [SeatoolAuthority.MedicaidSPA]: defaultCompleteIntakeContent,
  [SeatoolAuthority["1915b"]]: defaultCompleteIntakeContent,
  [SeatoolAuthority["1915c"]]: defaultCompleteIntakeContent,
};

export const getContentFor = (
  a: Action,
  p: SeatoolAuthority,
): FormContentHydrator => {
  const actionContentMap: Record<string, FormContentGroup> = {
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
  const group = actionContentMap?.[a];
  if (!group) throw new Error(`No content group for "${a}"`);
  const content = group[p];
  if (!content) throw new Error(`No content for "${p}" found in group "${a}`);
  return content;
};
