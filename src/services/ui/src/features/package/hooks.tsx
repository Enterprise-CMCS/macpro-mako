import { removeUnderscoresAndCapitalize } from "@/utils";
import { useEffect, useState } from "react";

export type DetailsSidebarLink = {
  id: string;
  href: string;
  displayName: string;
};

export const useDetailsSidebarLinks = (
  dataId?: string,
): DetailsSidebarLink[] => {
  const [sideBarLinks, setSideBarLinks] = useState<DetailsSidebarLink[]>([]);

  useEffect(() => {
    const ids = [
      "package_details",
      "package_activity",
      "administrative_package_changes",
      "appendix_k",
    ];

    // Check if dataId is not undefined before proceeding
    if (dataId) {
      const links = ids
        .filter((id) => document.getElementById(id) !== null)
        .map((id) => ({
          id,
          href: `?id=${encodeURIComponent(dataId)}#${id}`,
          displayName: removeUnderscoresAndCapitalize(id),
        }));

      setSideBarLinks(links);
    } else {
      setSideBarLinks([]);
    }
  }, [dataId]);

  return sideBarLinks;
};
