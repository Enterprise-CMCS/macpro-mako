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

const getSidebarLinks = (root: ParentNode = document) => {
  return root.querySelector(`#${ADMIN_CHANGES_LINK.id}`)
    ? [...BASE_SIDEBAR_LINKS, ADMIN_CHANGES_LINK]
    : BASE_SIDEBAR_LINKS;
};

const areSidebarLinksEqual = (
  current: DetailsSidebarLink[],
  next: DetailsSidebarLink[],
): boolean => {
  return (
    current.length === next.length &&
    current.every(
      (link, index) =>
        link.id === next[index]?.id &&
        link.href === next[index]?.href &&
        link.displayName === next[index]?.displayName,
    )
  );
};

const getSidebarObserverRoot = (): HTMLElement => {
  return (
    document.getElementById("package_details_page") ??
    document.getElementById("package_details")?.parentElement ??
    document.body
  );
};

export const useDetailsSidebarLinks = (): DetailsSidebarLink[] => {
  const [sideBarLinks, setSideBarLinks] = useState<DetailsSidebarLink[]>(BASE_SIDEBAR_LINKS);

  useLayoutEffect(() => {
    const observerRoot = getSidebarObserverRoot();
    const updateLinks = () => {
      setSideBarLinks((current) => {
        const next = getSidebarLinks(observerRoot);
        return areSidebarLinksEqual(current, next) ? current : next;
      });
    };

    updateLinks();

    const observer = new MutationObserver(updateLinks);
    observer.observe(observerRoot, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return sideBarLinks;
};
