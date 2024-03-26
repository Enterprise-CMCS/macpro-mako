import { Alert } from "@/components";
import { featureFlags } from "shared-utils";
import { useLDClient } from "launchdarkly-react-client-sdk";

export const MaintenanceBanner = () => {
  const banners = {
    UNSCHEDULED: (
      <h1 className="text-xl font-medium">Unschedule Maintenance Flag</h1>
    ),
    SCHEDULED: (
      <h1 className="text-xl font-medium">Scheduled Maintenance Flag</h1>
    ),
  };

  function getMaintenanceBanner(flag: string) {
    return banners[flag as keyof typeof banners] || undefined;
  }

  const ldClient = useLDClient();
  const siteUnderMaintenanceBannerFlag = ldClient?.variation(
    featureFlags.SITE_UNDER_MAINTENANCE_BANNER.flag,
    featureFlags.SITE_UNDER_MAINTENANCE_BANNER.defaultValue
  );

  const possibleMaintenanceBanner = getMaintenanceBanner(
    siteUnderMaintenanceBannerFlag
  );

  if (possibleMaintenanceBanner) {
    return (
      <Alert className="mb-6 w-5/6" variant="destructive">
        {possibleMaintenanceBanner}
      </Alert>
    );
  }
  return null;
};
