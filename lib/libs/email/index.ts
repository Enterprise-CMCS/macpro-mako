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
  "new-medicaid-submission": AuthoritiesWithUserTypesTemplate;
  "new-chip-submission": AuthoritiesWithUserTypesTemplate;
  "temp-extension": UserTypeOnlyTemplate;
  "withdraw-package": AuthoritiesWithUserTypesTemplate;
  "withdraw-rai": AuthoritiesWithUserTypesTemplate;
  "contracting-initial": AuthoritiesWithUserTypesTemplate;
  "contracting-renewal": AuthoritiesWithUserTypesTemplate;
  "contracting-waiver": AuthoritiesWithUserTypesTemplate;
  "capitated-initial": AuthoritiesWithUserTypesTemplate;
  "capitated-renewal": AuthoritiesWithUserTypesTemplate;
  "capitated-waiver": AuthoritiesWithUserTypesTemplate;
  "contracting-waiver-state": AuthoritiesWithUserTypesTemplate;
  "capitated-waiver-state": AuthoritiesWithUserTypesTemplate;

};

// Create a type-safe mapping of email templates
const emailTemplates: EmailTemplates = {
  "new-medicaid-submission": EmailContent.newSubmission,
  "new-chip-submission": EmailContent.newSubmission,
  "temp-extension": EmailContent.tempExtention,
  "withdraw-package": EmailContent.withdrawPackage,
  "withdraw-rai": EmailContent.withdrawRai,
  "contracting-initial": EmailContent.newSubmission,
  "capitated-initial": EmailContent.newSubmission,
  "capitated-renewal": EmailContent.newSubmission,
  "capitated-waiver": EmailContent.newSubmission,
  "contracting-renewal": EmailContent.newSubmission,
  "contracting-waiver": EmailContent.newSubmission,
  "contracting-waiver-state": EmailContent.newSubmission,
  "capitated-waiver-state": EmailContent.newSubmission,
};

// Create a type-safe lookup function
export function getEmailTemplate(
  action: keyof EmailTemplates,
): AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate {
  // Handle -state suffix variants
  console.log("Action:", action);
  const baseAction = action.replace(/-state$/, "") as keyof EmailTemplates;
  return emailTemplates[baseAction];
}

function isAuthorityTemplate(
  obj: any,
  authority: Authority,
): obj is AuthoritiesWithUserTypesTemplate {
  return authority in obj;
}

// Update the getEmailTemplates function to use the new lookup
export async function getEmailTemplates<T>(
  action: keyof EmailTemplates,
  authority: Authority,
): Promise<EmailTemplateFunction<T>[] | null> {
  const template = getEmailTemplate(action);
  if (!template) {
    console.log("No template found");
    return null;
  }

  const emailTemplatesToSend: EmailTemplateFunction<T>[] = [];

  if (isAuthorityTemplate(template, authority)) {
    emailTemplatesToSend.push(...Object.values(template[authority] as EmailTemplateFunction<T>));
  } else {
    emailTemplatesToSend.push(
      ...Object.values(template as Record<UserType, EmailTemplateFunction<T>>),
    );
  }

  console.log("Email templates to send:", JSON.stringify(emailTemplatesToSend, null, 2));
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
