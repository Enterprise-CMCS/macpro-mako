import { Authority, Events } from "shared-types";
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
  "capitated-initial": AuthoritiesWithUserTypesTemplate;
  "contracting-amendment": AuthoritiesWithUserTypesTemplate;
  "capitated-amendment": AuthoritiesWithUserTypesTemplate;
  "contracting-renewal": AuthoritiesWithUserTypesTemplate;
  "capitated-renewal": AuthoritiesWithUserTypesTemplate;
  "contracting-amendment-state": AuthoritiesWithUserTypesTemplate;
  "capitated-amendment-state": AuthoritiesWithUserTypesTemplate;
  "contracting-renewal-state": AuthoritiesWithUserTypesTemplate;
  "capitated-renewal-state": AuthoritiesWithUserTypesTemplate;
  "respond-to-rai": AuthoritiesWithUserTypesTemplate;
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
  "contracting-amendment": EmailContent.newSubmission,
  "capitated-amendment": EmailContent.newSubmission,
  "contracting-renewal": EmailContent.newSubmission,
  "capitated-renewal": EmailContent.newSubmission,
  "contracting-amendment-state": EmailContent.newSubmission,
  "capitated-amendment-state": EmailContent.newSubmission,
  "contracting-renewal-state": EmailContent.newSubmission,
  "capitated-renewal-state": EmailContent.newSubmission,
  "respond-to-rai": EmailContent.respondToRai,
};

// Create a type-safe lookup function
export function getEmailTemplate(
  action: keyof EmailTemplates,
): AuthoritiesWithUserTypesTemplate | UserTypeOnlyTemplate {
  // Handle -state suffix variants
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
export async function getLatestMatchingEvent(id: string): Promise<Events["RespondToRai"] | null> {
  try {
    const item = await getPackageChangelog(id);

    // Check if item exists and has hits
    if (!item?.hits?.hits?.length) {
      console.log(`No changelog found for package ${id}`);
      return null;
    }

    // Filter matching events
    const events = item.hits.hits.filter((hit: any) => {
      const source = hit._source;
      return source?.event === "respond-to-rai" || source?.actionType === "respond-to-rai";
    });

    // Check if any matching events were found
    if (!events.length) {
      console.log(`No events found with actionType respond-to-rai for package ${id}`);
      return null;
    }

    // Sort events by timestamp (most recent first)
    events.sort((a: any, b: any) => {
      const timestampA = a._source?.timestamp ?? 0;
      const timestampB = b._source?.timestamp ?? 0;
      return timestampB - timestampA;
    });

    // Get the latest event
    const latestMatchingEvent = events[0]?._source;
    if (!latestMatchingEvent) {
      console.log(`Latest event for ${id} with actionType respond-to-rai has no source data`);
      return null;
    }

    return latestMatchingEvent as unknown as Events["RespondToRai"];
  } catch (error) {
    console.error("Error getting latest matching event:", { id, error });
    return null;
  }
}

export * from "./getAllStateUsers";
