import { useLDClient } from "launchdarkly-react-client-sdk";
import { featureFlags } from "shared-utils";

export const useHideBanner = (): boolean => {
  const ldClient = useLDClient();
  const isBannerHidden: boolean =
    ldClient?.variation(
      featureFlags.UAT_HIDE_MMDL_BANNER.flag,
      featureFlags.UAT_HIDE_MMDL_BANNER.defaultValue,
    ) === "on";
  return isBannerHidden;
};
