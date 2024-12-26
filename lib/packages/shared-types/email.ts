import { Events } from ".";

import { Authority } from "./authority";

export type EmailAddresses = {
  osgEmail: string[];
  dpoEmail: string[];
  dmcoEmail: string[];
  dhcbsooEmail: string[];
  chipInbox: string[];
  chipCcList: string[];
  sourceEmail: string;
  srtEmails: string[];
  cpocEmail: string[];
};

export interface CommonEmailVariables {
  id: string;
  authority: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
  allStateUsersEmails?: string[];
  responseDate?: number;
  title?: string;
}

export interface RelatedEventType {
  submitterName: string;
  submitterEmail: string;
}

// Base email template props
export interface BaseEmailProps {
  previewText: string;
  heading: string;
  applicationEndpointUrl: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
}

// Base email response structure
export interface EmailResponse {
  to: string[];
  subject: string;
  html: string;
  text: string;
  cc?: string[];
}

// Generic type for email template functions
export type EmailTemplateFunction<T extends keyof Events> = (
  variables: Events[T] & CommonEmailVariables & { emails: EmailAddresses },
) => Promise<EmailResponse>;

// Template types for different user types
export interface UserTypeTemplate {
  cms: EmailTemplateFunction<any>;
  state: EmailTemplateFunction<any>;
}

// Template types for different authorities
export type AuthorityTemplate = Record<Authority, UserTypeTemplate>;

// Event specific template props
export interface RaiWithdrawTemplateProps {
  variables: Events["RespondToRai"] & CommonEmailVariables;
  relatedEvent: any;
}

export interface NewSubmissionTemplateProps<T extends keyof Events> {
  variables: Events[T] & CommonEmailVariables;
}

export interface WithdrawPackageTemplateProps {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}
export interface WithdrawRaiTemplateProps {
  variables: Events["WithdrawRai"] & CommonEmailVariables;
}

export interface TempExtensionTemplateProps {
  variables: Events["TempExtension"] & CommonEmailVariables;
}
