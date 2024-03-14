export const isProd =
  window.location.hostname === "mako.cms.gov" ||
  window.location.hostname === "onemac.cms.gov";

export const isFaqPage = window.location.pathname.startsWith("/faq");
