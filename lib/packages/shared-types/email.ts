import { Events, ActionType } from ".";

import { Authority } from "./authority";

type EmailString = string & { __brand: "email" };
type EmailArray = EmailString[];

/** Email addresses configuration for different roles and services */
export type EmailAddresses = {
  osgEmail: EmailArray;
  dpoEmail: EmailArray;
  dmcoEmail: EmailArray;
  dhcbsooEmail: EmailArray;
  chipInbox: EmailArray;
  chipCcList: EmailArray;
  sourceEmail: string;
  srtEmails: string[];
  cpocEmail: string[];
};

/** Common variables shared across all email templates */
export interface CommonEmailVariables {
  id: string;
  authority: string;
  territory: string;
  applicationEndpointUrl: string;
  event: EventType;
  actionType: ActionType;
  allStateUsersEmails?: string[];
  responseDate?: number;
  title?: string;
}

export type EventType =
  | "new-submission"
  | "new-chip-submission"
  | "new-medicaid-submission"
  | "upload-subsequent-documents"
  | "toggle-withdraw-rai"
  | "respond-to-rai"
  | "temporary-extension"
  | "withdraw-package"
  | "withdraw-rai"
  | "app-k"
  | "capitated-initial"
  | "capitated-renewal"
  | "capitated-amendment"
  | "contract-initial"
  | "contract-renewal"
  | "contract-amendment";

export interface RelatedEventType {
  submitterName: string;
  submitterEmail: string;
}

// Base email template props
export interface BaseEmailProps<T = unknown> {
  previewText: string;
  heading: string;
  applicationEndpointUrl: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
  customProps?: T;
}

// Base email response structure
export interface EmailResponse {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
}

export type EmailError = {
  code: string;
  message: string;
};

// Generic type for email template functions
export type EmailTemplateFunction<T extends keyof Events> = (
  variables: Events[T] & CommonEmailVariables & { emails: EmailAddresses },
) => Promise<EmailResponse | EmailError>;

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

export interface UploadSubsequentDocumentsTemplateProps {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}

export interface ContractingInitialTemplateProps {
  variables: Events["ContractingInitial"] & CommonEmailVariables;
}

export interface ContractingAmendmentTemplateProps {
  variables: Events["ContractingAmendment"] & CommonEmailVariables;
}

export interface ContractingRenewalTemplateProps {
  variables: Events["ContractingRenewal"] & CommonEmailVariables;
}

export interface CapitatedAmendmentTemplateProps {
  variables: Events["CapitatedAmendment"] & CommonEmailVariables;
}
