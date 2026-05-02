import { useLayoutEffect, useState } from "react";

export type DetailsSidebarLink = {
  id: string;
  href: string;
  displayName: string;
};

const BASE_SIDEBAR_LINKS: DetailsSidebarLink[] = [
  {
    id: "package_details",
    href: "#package_details",
    displayName: "Package Details",
  },
  {
    id: "package_activity",
    href: "#package_activity",
    displayName: "Package Activity",
  },
];

const ADMIN_CHANGES_LINK: DetailsSidebarLink = {
  id: "administrative_package_changes",
  href: "#administrative_package_changes",
  displayName: "Administrative Package Changes",
};

const getSidebarLinks = () => {
  return document.getElementById("administrative_package_changes")
    ? [...BASE_SIDEBAR_LINKS, ADMIN_CHANGES_LINK]
    : BASE_SIDEBAR_LINKS;
};

const areSidebarLinksEqual = (left: DetailsSidebarLink[], right: DetailsSidebarLink[]) =>
  left.length === right.length && left.every((link, index) => link.id === right[index]?.id);

export const useDetailsSidebarLinks = (): DetailsSidebarLink[] => {
  const [sideBarLinks, setSideBarLinks] = useState<DetailsSidebarLink[]>(BASE_SIDEBAR_LINKS);

  useLayoutEffect(() => {
    const updateLinks = () => {
      setSideBarLinks((currentLinks) => {
        const nextLinks = getSidebarLinks();
        return areSidebarLinksEqual(currentLinks, nextLinks) ? currentLinks : nextLinks;
      });
    };

    updateLinks();

    const observer = new MutationObserver(updateLinks);
    const root = document.getElementById("package_details")?.parentElement ?? document.body;
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return sideBarLinks;
};
