export const emailTemplateValue = {
  territory: "CO",
  applicationEndpointUrl: "https://mako-dev.cms.gov",
  timestamp: Date.now(),
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  additionalInformation:
    "This submission includes necessary documentation for requested updates to the state’s Medicaid plan, in alignment with CMS requirements.",
  origin: "mako" as const,
  appkParentId: null,
  proposedEffectiveDate: Date.now() + 5184000000,
};
