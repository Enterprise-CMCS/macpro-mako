import { useLDClient } from "launchdarkly-react-client-sdk";
import { featureFlags } from "shared-utils";

export const useFeatureFlag = (flagKey: keyof typeof featureFlags): boolean => {
  const ldClient = useLDClient();

  if (!ldClient) {
    return false;
  }

  const flagValue = ldClient?.variation(
    featureFlags[flagKey].flag,
    featureFlags[flagKey].defaultValue,
  );

  return flagValue === "on" || flagValue === true;
};
