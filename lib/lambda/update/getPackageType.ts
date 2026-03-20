import { getPackageChangelog } from "libs/api/package";
import { events } from "shared-types";

function isKnownPackageEvent(event: string): event is keyof typeof events {
  return event in events;
}

export const getPackageType = async (packageId: string): Promise<keyof typeof events> => {
  // use event of current package to determine how ID should be formatted
  const packageChangelog = await getPackageChangelog(packageId);
  const packageSubmissionType = packageChangelog.hits.hits.find((pkg) => {
    return !!pkg._source?.event && isKnownPackageEvent(pkg._source.event);
  });

  if (!packageSubmissionType || !isKnownPackageEvent(packageSubmissionType._source.event)) {
    throw new Error("The type of package could not be determined.");
  }

  return packageSubmissionType._source.event;
};
