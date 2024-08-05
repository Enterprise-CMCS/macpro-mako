import { useGetItem } from "@/api";
import { useLayoutEffect, useState } from "react";

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
      { id: "package_details", label: "Package Details" },
      { id: "package_activity", label: "Package Activity" },
      {
        id: "administrative_package_changes",
        label: "Administrative Package Changes",
      },
    ];

    // Check if dataId is not undefined before proceeding
    if (data?._id) {
      const links = ids
        .filter(({ id }) => document.getElementById(id) !== null)
        .map((link) => ({
          id: link.id,
          href: `#${link.id}`,
          displayName: link.label,
        }));

      setSideBarLinks(links);
    } else {
      setSideBarLinks([]);
    }
  }, [dataId, data]);

  return sideBarLinks;
};
