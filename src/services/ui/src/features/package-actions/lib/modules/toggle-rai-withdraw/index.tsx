import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import { ActionFormDescription, PackageSection } from "@/components";
import { z } from "zod";
import { CheckStatusFunction } from "@/utils/Poller/seaStatusPoller";

// react-hook-form needs any kind of schema to prevent an undefined error
export const defaultEnableRaiWithdrawSchema = z.object({});
export const defaultEnableRaiWithdrawFields: ReactElement[] = [
  <ActionFormDescription key={"field-description"}>
    Once you submit this form, the most recent Formal RAI Response for this
    package will be able to be withdrawn by the state.{" "}
    <strong className="font-bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionFormDescription>,
  <PackageSection key={"section-packageinfo"} />,
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
  <ActionFormDescription key={"section-description"}>
    The state will not be able to withdraw its RAI response. It may take up to a
    minute for this change to be applied.{" "}
    <strong className="font-bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionFormDescription>,
  <PackageSection key={"section-packageinfo"} />,
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

export const raiWithdrawalDisabled: CheckStatusFunction = (checks) =>
  !checks.hasEnabledRaiWithdraw;

export const raiWithdrawalEnabled: CheckStatusFunction = (checks) =>
  checks.hasEnabledRaiWithdraw;
