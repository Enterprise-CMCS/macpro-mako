export const isProd =
  window.location.hostname === "mako.cms.gov" ||
  window.location.hostname === "onemac.cms.gov";

export const isFaqPage = window.location.pathname.startsWith("/faq");

export const isNewSubmission = () =>
  window.location.href.includes("new-submission");
