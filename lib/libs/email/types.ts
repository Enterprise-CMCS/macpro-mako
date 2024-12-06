import {
  Authority,
  CommonEmailVariables,
  EmailAddresses,
  Events,
  RaiWithdraw,
  WithdrawPackage,
} from "shared-types";

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
  variables: RaiWithdraw & CommonEmailVariables;
  relatedEvent: any;
}

export interface NewSubmissionTemplateProps<T extends keyof Events> {
  variables: Events[T] & CommonEmailVariables;
}

export interface WithdrawPackageTemplateProps {
  variables: WithdrawPackage & CommonEmailVariables;
}

export interface TempExtensionTemplateProps {
  variables: Events["TempExtension"] & CommonEmailVariables;
}
