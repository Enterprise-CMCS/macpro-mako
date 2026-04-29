import type { changelog } from "shared-types/opensearch";

export function getPackageActivityLabel(event: changelog.Document["event"]): string {
  switch (event) {
    case "capitated-amendment":
    case "capitated-initial":
    case "capitated-renewal":
    case "contracting-amendment":
    case "contracting-initial":
    case "contracting-renewal":
    case "new-chip-submission":
    case "new-chip-details-submission":
    case "new-medicaid-submission":
    case "temporary-extension":
    case "app-k":
      return "Initial Package Submitted";
    case "withdraw-package":
      return "Package - Withdrawal Requested";
    case "legacy-withdraw-rai-request":
    case "withdraw-rai":
      return "Formal RAI Response - Withdrawal Requested";
    case "respond-to-rai":
      return "RAI Response Submitted";
    case "upload-subsequent-documents":
      return "Subsequent Document(s) Uploaded";
    default:
      return "";
  }
}

export function slugifyPackageActivityLabel(label: string): string {
  return label
    .replace(/\(s\)/gi, "s")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getPackageActivityLabelSlug(event: changelog.Document["event"]): string {
  return slugifyPackageActivityLabel(getPackageActivityLabel(event)) || "package-activity";
}
