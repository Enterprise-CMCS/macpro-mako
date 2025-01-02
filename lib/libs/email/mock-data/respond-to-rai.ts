export const emailTemplateValue = {
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  get timestamp() {
    return Date.now();
  },
  actionType: "Respond to Formal RAI",
  origin: "mako" as const,
  get requestedDate() {
    return Date.now();
  },
  get responseDate() {
    return Date.now();
  },
  additionalInformation:
    "Octopuses are usually very antisocial but when they’re under the influence of ecstasy they are more willing to spend time around each other or even hug other octopuses",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  get submissionDate() {
    return Date.now();
  },
  get proposedEffectiveDate() {
    return Date.now() + 5184000000;
  },
};
