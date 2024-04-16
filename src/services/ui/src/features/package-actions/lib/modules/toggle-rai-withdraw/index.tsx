import { FormContentHydrator } from "@/features/package-actions/lib/contentSwitch";
import { ReactElement } from "react";
import { ActionDescription, PackageSection } from "@/components";
import { z } from "zod";

// react-hook-form needs any kind of schema to prevent an undefined error
export const defaultEnableRaiWithdrawSchema = z.object({});
export const defaultEnableRaiWithdrawFields: ReactElement[] = [
  <ActionDescription key={"field-description"}>
    Once you submit this form, the most recent Formal RAI Response for this
    package will be able to be withdrawn by the state.{" "}
    <strong className="font-bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
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
  <ActionDescription key={"section-description"}>
    The state will not be able to withdraw its RAI response. It may take up to a
    minute for this change to be applied.{" "}
    <strong className="font-bold">
      If you leave this page, you will lose your progress on this form.
    </strong>
  </ActionDescription>,
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
