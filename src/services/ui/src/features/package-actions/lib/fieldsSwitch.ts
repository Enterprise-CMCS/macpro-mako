import { Action, SeatoolAuthority } from "shared-types";
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

type FieldsGroup = Partial<Record<SeatoolAuthority, ReactElement[]>>;

const issueRaiFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultIssueRaiFields,
  [SeatoolAuthority.MedicaidSPA]: defaultIssueRaiFields,
  [SeatoolAuthority["1915b"]]: defaultIssueRaiFields,
  [SeatoolAuthority["1915c"]]: defaultIssueRaiFields,
};

const respondToRaiFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: chipSpaRaiFields,
  [SeatoolAuthority.MedicaidSPA]: medSpaRaiFields,
  [SeatoolAuthority["1915b"]]: bWaiverRaiFields,
  [SeatoolAuthority["1915c"]]: bWaiverRaiFields,
};

const enableRaiWithdrawFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultEnableRaiWithdrawFields,
  [SeatoolAuthority.MedicaidSPA]: defaultEnableRaiWithdrawFields,
  [SeatoolAuthority["1915b"]]: defaultEnableRaiWithdrawFields,
  [SeatoolAuthority["1915c"]]: defaultEnableRaiWithdrawFields,
};

const disableRaiWithdrawFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultDisableRaiWithdrawFields,
  [SeatoolAuthority.MedicaidSPA]: defaultDisableRaiWithdrawFields,
  [SeatoolAuthority["1915b"]]: defaultDisableRaiWithdrawFields,
  [SeatoolAuthority["1915c"]]: defaultDisableRaiWithdrawFields,
};

const withdrawRaiFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultWithdrawRaiFields,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawRaiFields,
  [SeatoolAuthority["1915b"]]: defaultWithdrawRaiFields,
  [SeatoolAuthority["1915c"]]: defaultWithdrawRaiFields,
};

const withdrawPackageFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: chipWithdrawPackageFields,
  [SeatoolAuthority.MedicaidSPA]: defaultWithdrawPackageFields,
  [SeatoolAuthority["1915b"]]: defaultWithdrawPackageFields,
  [SeatoolAuthority["1915c"]]: defaultWithdrawPackageFields,
};

const tempExtensionFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultTempExtFields,
  [SeatoolAuthority.MedicaidSPA]: defaultTempExtFields,
  [SeatoolAuthority["1915b"]]: defaultTempExtFields,
  [SeatoolAuthority["1915c"]]: defaultTempExtFields,
};

const updateIdFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultUpdateIdFields,
  [SeatoolAuthority.MedicaidSPA]: defaultUpdateIdFields,
  [SeatoolAuthority["1915b"]]: defaultUpdateIdFields,
  [SeatoolAuthority["1915c"]]: defaultUpdateIdFields,
};

const completeIntakeFor: FieldsGroup = {
  [SeatoolAuthority.CHIPSPA]: defaultCompleteIntakeFields,
  [SeatoolAuthority.MedicaidSPA]: defaultCompleteIntakeFields,
  [SeatoolAuthority["1915b"]]: defaultCompleteIntakeFields,
  [SeatoolAuthority["1915c"]]: defaultCompleteIntakeFields,
};

export const getFieldsFor = (
  a: Action,
  p: SeatoolAuthority,
): ReactElement[] => {
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
