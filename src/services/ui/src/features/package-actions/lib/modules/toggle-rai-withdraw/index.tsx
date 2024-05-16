import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import { ActionFormDescription } from "@/components";
import { z } from "zod";
import { CheckDocumentFunction } from "@/utils/Poller/documentPoller";

// react-hook-form needs any kind of schema to prevent an undefined error
export const defaultEnableRaiWithdrawSchema = z.object({});
export const defaultEnableRaiWithdrawFields: ReactElement[] = [
  <ActionFormDescription boldReminder key={"field-description"}>
    Once you submit this form, the most recent Formal RAI Response for this
    package will be able to be withdrawn by the state.
  </ActionFormDescription>,
];
export const defaultEnableRaiWithdrawContent: FormContentHydrator = (
  document,
) => ({
  title: "Enable Formal RAI Response Withdraw Details",
  successBanner: {
    header: "RAI response withdrawal Enabled",
    body: "The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
  },
});

// react-hook-form needs any kind of schema to prevent an undefined error
export const defaultDisableRaiWithdrawSchema = z.object({});
export const defaultDisableRaiWithdrawFields: ReactElement[] = [
  <ActionFormDescription boldReminder key={"section-description"}>
    The state will not be able to withdraw its RAI response. It may take up to a
    minute for this change to be applied.
  </ActionFormDescription>,
];
export const defaultDisableRaiWithdrawContent: FormContentHydrator = (
  document,
) => ({
  title: "Disable Formal RAI Response Withdraw Details",
  successBanner: {
    header: "RAI response withdrawal Disabled",
    body: "The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
  },
});

export const raiWithdrawalDisabled: CheckDocumentFunction = (checks) =>
  !checks.hasEnabledRaiWithdraw;

export const raiWithdrawalEnabled: CheckDocumentFunction = (checks) =>
  checks.hasEnabledRaiWithdraw;
