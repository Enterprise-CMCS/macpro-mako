import { add, sub } from "date-fns";

export const emailTemplateValue = {
  event: "respond-to-rai" as const,
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  get timestamp() {
    return Date.now();
  },
  actionType: "Respond to Formal RAI",
  origin: "mako" as const,
  get requestedDate() {
    return Date.now();
  },
  additionalInformation:
    "Octopuses are usually very antisocial but when they're under the influence of ecstasy they are more willing to spend time around each other or even hug other octopuses",
  submitterName: "George Harrison",
  submitterEmail: "george@example.com",
  get submissionDate() {
    return sub(Date.now(), { days: 20 });
  },
  get raiRequestedDate() {
    return sub(Date.now(), { days: 7 }); // pauseDuration
  },
  get proposedEffectiveDate() {
    return add(Date.now(), { days: 60 });
  },
};
