import { useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";
import { featureFlags } from "shared-utils";

export const useCmsHomepageFlag = (): boolean => {
  const ldClient = useLDClient();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkFlag = async () => {
      if (ldClient) {
        const result = await ldClient.variation(
          featureFlags.CMS_HOMEPAGE_FLAG.flag,
          featureFlags.CMS_HOMEPAGE_FLAG.defaultValue,
        );
        setIsEnabled(result === "on");
      }
    };

    checkFlag();
  }, [ldClient]);

  return isEnabled;
};
