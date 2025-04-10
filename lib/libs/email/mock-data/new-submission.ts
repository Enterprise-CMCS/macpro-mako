export const emailTemplateValue = {
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  get timestamp() {
    return Date.now();
  },
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation:
    "This submission includes necessary documentation for requested updates to the state’s Medicaid plan, in alignment with CMS requirements.",
  origin: "mako" as const,
  appkParentId: null,
  get proposedEffectiveDate() {
    return Date.now() + 5184000000;
  },
};
