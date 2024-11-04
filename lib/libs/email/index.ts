import { Authority } from "shared-types";
import { getPackageChangelog } from "../api/package";
import * as EmailContent from "./content";

export type UserType = "cms" | "state";

export interface EmailTemplate {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
}

export type EmailTemplateFunction<T> = (variables: T) => Promise<EmailTemplate>;
export type UserTypeOnlyTemplate = {
  [U in UserType]: EmailTemplateFunction<any>;
};
export type AuthoritiesWithUserTypesTemplate = {
  [A in Authority]?: { [U in UserType]?: EmailTemplateFunction<any> };
};

export type EmailTemplates = {
  "new-medicaid-submission": AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate;
  "new-chip-submission": AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate;
};

export const emailTemplates = {
  "new-medicaid-submission": EmailContent.newSubmission,
  "new-chip-submission": EmailContent.newSubmission,
  "temp-extension": EmailContent.tempExtention,
  "withdraw-package": EmailContent.withdrawPackage,
  "withdraw-rai": EmailContent.withdrawRai,
};

function isAuthorityTemplate(obj: any, authority: Authority): obj is AuthoritiesWithUserTypesTemplate {
  return authority in obj;
}

export async function getEmailTemplates<T>(action: keyof EmailTemplates, authority: Authority): Promise<EmailTemplateFunction<T>[] | null> {
  const template = emailTemplates[action];
  if (!template) {
    console.log("No template found");
    return null;
  }

  const emailTemplatesToSend: EmailTemplateFunction<T>[] = [];

  if (isAuthorityTemplate(template, authority)) {
    emailTemplatesToSend.push(...Object.values(template[authority] as EmailTemplateFunction<T>));
  } else {
    emailTemplatesToSend.push(...Object.values(template as EmailTemplateFunction<T>));
  }

  return emailTemplatesToSend;
}

// I think this needs to be written to handle not finding any matching events and so forth
export async function getLatestMatchingEvent(id: string, actionType: string) {
  const item = await getPackageChangelog(id);
  const events = item.hits.hits.filter((hit: any) => hit._source.actionType === actionType);
  events.sort((a: any, b: any) => b._source.timestamp - a._source.timestamp);
  const latestMatchingEvent = events[0]._source;
  return latestMatchingEvent;
}

export * from "./getAllStateUsers";
