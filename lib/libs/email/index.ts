import { Authority } from "shared-types";
import { getPackageChangelog } from "../api/package";
import * as EmailContent from "./content/index.js";

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
  "temporary-extension": UserTypeOnlyTemplate;
  "withdraw-package": AuthoritiesWithUserTypesTemplate;
  "withdraw-rai": AuthoritiesWithUserTypesTemplate;

  "upload-subsequent-documents": AuthoritiesWithUserTypesTemplate;
  "contracting-initial": AuthoritiesWithUserTypesTemplate;
  "contracting-renewal": AuthoritiesWithUserTypesTemplate;
  "contracting-waiver": AuthoritiesWithUserTypesTemplate;
  "contracting-amendment": AuthoritiesWithUserTypesTemplate;

  "capitated-initial": AuthoritiesWithUserTypesTemplate;
  "capitated-renewal": AuthoritiesWithUserTypesTemplate;
  "capitated-waiver": AuthoritiesWithUserTypesTemplate;
  "capitated-amendment": AuthoritiesWithUserTypesTemplate;

  "app-k": AuthoritiesWithUserTypesTemplate;

  "respond-to-rai": AuthoritiesWithUserTypesTemplate;
};

// Create a type-safe mapping of email templates
const emailTemplates: EmailTemplates = {
  "new-medicaid-submission": EmailContent.newSubmission,
  "new-chip-submission": EmailContent.newSubmission,
  "temporary-extension": EmailContent.tempExtention,

  "capitated-initial": EmailContent.newSubmission,
  "capitated-renewal": EmailContent.newSubmission,
  "capitated-waiver": EmailContent.newSubmission,
  "capitated-amendment": EmailContent.newSubmission,
  "upload-subsequent-documents": EmailContent.uploadSubsequentDocuments,

  "contracting-initial": EmailContent.newSubmission,
  "contracting-renewal": EmailContent.newSubmission,
  "contracting-waiver": EmailContent.newSubmission,
  "contracting-amendment": EmailContent.newSubmission,

  "app-k": EmailContent.newSubmission, // 1915(c) Appendix K

  "withdraw-package": EmailContent.withdrawPackage,
  "withdraw-rai": EmailContent.withdrawRai,
  "respond-to-rai": EmailContent.respondToRai,
};

// Create a type-safe lookup function
export function getEmailTemplate(
  action: keyof EmailTemplates,
): AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate {
  // Handle -state suffix variants and old key references
  console.log("Action:", action);
  const baseAction = action.replace(/-state$/, "") as keyof EmailTemplates;
  if (baseAction === "temporary-extension") {
    return emailTemplates["temporary-extension"];
  }
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
  try {
    const item = await getPackageChangelog(id);
    const events = item.hits.hits.filter((hit: any) => hit._source.actionType === actionType);
    events.sort((a: any, b: any) => b._source.timestamp - a._source.timestamp);
    const latestMatchingEvent = events[0]._source;
    return latestMatchingEvent;
  } catch (error) {
    console.error({ error })
    return null;
  }
}

export * from "./getAllStateUsers";
