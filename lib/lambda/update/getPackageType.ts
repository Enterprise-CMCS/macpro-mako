import { getPackageChangelog } from "libs/api/package";
import { events } from "shared-types";

function isKnownPackageEvent(event: string): event is keyof typeof events {
  return event in events;
}

const packageIdValidationEvents = new Set<keyof typeof events>([
  "app-k",
  "capitated-amendment",
  "capitated-initial",
  "capitated-renewal",
  "contracting-amendment",
  "contracting-initial",
  "contracting-renewal",
  "new-chip-details-submission",
  "new-chip-submission",
  "new-medicaid-submission",
  "temporary-extension",
]);

type PackageTypeContext = {
  packageId: string;
  authority?: string | null;
  actionType?: string | null;
};

function resolvePackageTypeFromAuthorityAndActionType({
  authority,
  actionType,
}: Omit<PackageTypeContext, "packageId">): keyof typeof events | undefined {
  const normalizedAuthority = authority?.trim().toLowerCase();
  const normalizedActionType = actionType?.trim().toLowerCase();

  switch (normalizedAuthority) {
    case "medicaid spa":
      return "new-medicaid-submission";
    case "chip spa":
      return "new-chip-submission";
    case "1915(b)":
      if (normalizedActionType === "extend") {
        return "temporary-extension";
      }
      if (normalizedActionType === "renew") {
        return "capitated-renewal";
      }
      if (normalizedActionType === "amend") {
        return "capitated-amendment";
      }
      return "capitated-initial";
    case "1915(c)":
      if (normalizedActionType === "extend") {
        return "temporary-extension";
      }
      if (normalizedActionType === "renew") {
        return "contracting-renewal";
      }
      if (normalizedActionType === "amend") {
        return "app-k";
      }
      return "contracting-initial";
    default:
      return undefined;
  }
}

function resolvePackageTypeFromId(packageId: string): keyof typeof events | undefined {
  if (/^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/.test(packageId)) {
    return "new-medicaid-submission";
  }

  if (/^[A-Z]{2}-\d{4,5}\.R\d{2}\.TE\d{2}$/.test(packageId)) {
    return "temporary-extension";
  }

  if (/^[A-Z]{2}-\d{4,5}\.R00\.00$/.test(packageId)) {
    return "capitated-initial";
  }

  if (/^[A-Z]{2}-\d{4,5}\.R(?!00)\d{2}\.[0]{2}$/.test(packageId)) {
    return "capitated-renewal";
  }

  if (/^[A-Z]{2}-\d{4,5}\.R\d{2}\.(?!00)\d{2}$/.test(packageId)) {
    return "capitated-amendment";
  }

  return undefined;
}

export const getPackageType = async ({
  packageId,
  authority,
  actionType,
}: PackageTypeContext): Promise<keyof typeof events> => {
  // Use the latest submission-style event to determine how ID updates should be validated.
  const packageChangelog = await getPackageChangelog(packageId);
  const packageSubmissionType = packageChangelog.hits.hits.find((pkg) => {
    const event = pkg._source?.event;
    return (
      typeof event === "string" &&
      isKnownPackageEvent(event) &&
      packageIdValidationEvents.has(event)
    );
  });

  if (!packageSubmissionType || !isKnownPackageEvent(packageSubmissionType._source.event)) {
    const fallbackPackageType =
      resolvePackageTypeFromAuthorityAndActionType({ authority, actionType }) ??
      resolvePackageTypeFromId(packageId);

    if (!fallbackPackageType) {
      throw new Error("The type of package could not be determined.");
    }

    return fallbackPackageType;
  }

  return packageSubmissionType._source.event;
};
