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
  accessEmail: string;
  userRoleCc?: string;
};

export interface CommonEmailVariables {
  id: string;
  authority: string;
  territory: string;
  applicationEndpointUrl: string;
  actionType: string;
  allStateUsersEmails?: string[];
  title?: string;
  chipEligibility?: boolean;
}

export interface RelatedEventType {
  submitterName: string;
  submitterEmail: string;
}
