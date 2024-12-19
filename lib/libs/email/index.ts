import { Authority, CommonEmailVariables, EmailAddresses } from "shared-types";
import { getPackageChangelog } from "../api/package";
import * as EmailContent from "./content";

export type UserType = "cms" | "state";

export interface EmailTemplateFunction<T> {
  (
    variables: T & CommonEmailVariables & { emails: EmailAddresses; allStateUsersEmails: string[] },
  ): Promise<{
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
  }>;
}

export type UserTypeOnlyTemplate = {
  [U in UserType]: EmailTemplateFunction<any>;
};

export type AuthoritiesWithUserTypesTemplate = {
  [A in Authority]?: Partial<Record<UserType, EmailTemplateFunction<any>>>;
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
  "app-k": EmailContent.newSubmission,
  "withdraw-package": EmailContent.withdrawPackage,
  "withdraw-rai": EmailContent.withdrawRai,
  "respond-to-rai": EmailContent.respondToRai,
};

/**
 * Returns the email templates for a given action and authority
 * @param action The event action
 * @param authority The package authority
 */
export function getEmailTemplate(
  action: keyof EmailTemplates,
): AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate {
  const baseAction = action.replace(/-state$/, "") as keyof EmailTemplates;
  return emailTemplates[baseAction];
}

function isAuthorityTemplate(
  obj: any,
  authority: Authority,
): obj is AuthoritiesWithUserTypesTemplate {
  return authority in obj;
}

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
    const userTypeTemplate = template[authority];
    if (!userTypeTemplate) return null;
    emailTemplatesToSend.push(
      ...(Object.values(userTypeTemplate).filter(Boolean) as EmailTemplateFunction<T>[]),
    );
  } else {
    // UserTypeOnlyTemplate scenario
    emailTemplatesToSend.push(...Object.values(template as UserTypeOnlyTemplate));
  }

  return emailTemplatesToSend;
}

/**
 * Gets the latest event of a given action type from the changelog
 */
export async function getLatestMatchingEvent(id: string, actionType: string) {
  try {
    const item = await getPackageChangelog(id);
    const events = item.hits.hits.filter((hit: any) => hit._source.actionType === actionType);
    events.sort((a: any, b: any) => b._source.timestamp - a._source.timestamp);
    const latestMatchingEvent = events[0]?._source;
    return latestMatchingEvent;
  } catch (error) {
    console.error({ error });
    return null;
  }
}
