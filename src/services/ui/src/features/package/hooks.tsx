import { useGetItem } from "@/api";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { useEffect, useLayoutEffect, useState } from "react";

export type DetailsSidebarLink = {
  id: string;
  href: string;
  displayName: string;
};

export const useDetailsSidebarLinks = (
  dataId: string,
): DetailsSidebarLink[] => {
  const { data } = useGetItem(dataId);
  const [sideBarLinks, setSideBarLinks] = useState<DetailsSidebarLink[]>([]);

  useLayoutEffect(() => {
    const ids = [
      "package_details",
      "package_activity",
      "administrative_package_changes",
      "appendix_k",
    ];

    // Check if dataId is not undefined before proceeding
    if (data?._id) {
      const links = ids
        .filter((id) => document.getElementById(id) != null)
        .map((id) => ({
          id,
          href: `?id=${encodeURIComponent(dataId)}#${id}`,
          displayName: removeUnderscoresAndCapitalize(id),
        }));

      setSideBarLinks(links);
    } else {
      setSideBarLinks([]);
    }
  }, [dataId, data]);

  return sideBarLinks;
};
