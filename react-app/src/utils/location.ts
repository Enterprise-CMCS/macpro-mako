export const isProd =
  typeof window !== "undefined" &&
  (window.location.hostname === "mako.cms.gov" || window.location.hostname === "onemac.cms.gov");

export const isFaqPage =
  typeof window !== "undefined" && window.location.pathname.startsWith("/faq");
